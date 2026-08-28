import {
  defaultRouter,
  i2pdConfig,
  nextKey,
  tunnelDir,
  generateI2pdConf,
  generateTunnelsConf,
} from '../fileModels/i2pd'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { bridgeHost, parseI2pKey, reloadI2pdTunnels } from '../utils'

const { InputSpec, Value, Variants } = sdk

const privateKeySpec = InputSpec.of({
  privateKey: Value.text({
    name: i18n('Private Key (.dat file, base64), optional'),
    description: i18n(
      'Paste the base64-encoded contents of an existing i2pd .dat key file to reuse a known .b32.i2p address. Leave blank to auto-generate a new address. Only EdDSA-SHA512-ED25519 + ElGamal keys (679 bytes) are supported.',
    ),
    required: false,
    default: null,
    placeholder: null,
    patterns: [
      {
        regex: '^[A-Za-z0-9+/\\s]+=*$',
        description: i18n('Must be a valid base64 string'),
      },
    ],
    masked: true,
    inputmode: 'text',
    minLength: 908,
    maxLength: 916,
  }),
})

const inputSpec = InputSpec.of({
  urlPluginMetadata: Value.hidden<{
    packageId: string
    interfaceId: string
    hostId: string
    internalPort: number
  }>(),
  ssl: Value.toggle({
    name: i18n('SSL'),
    description: i18n('Serve this address with SSL'),
    default: false,
  }),
}).add(({ Value }) => ({
  address: Value.dynamicUnion(async ({ prefill }) => {
    const { packageId, hostId, internalPort } = prefill?.urlPluginMetadata ?? {}

    const config = await i2pdConfig.read().once()
    const entries =
      (packageId && hostId && config?.i2pServices?.[packageId]?.[hostId]) || {}

    const variants: Record<
      string,
      {
        name: string
        spec: ReturnType<typeof InputSpec.of>
      }
    > = {}

    for (const [key, entry] of Object.entries(entries)) {
      if (internalPort == null) continue

      // Show address only if it partially serves this binding (has one of SSL/non-SSL but not both)
      const bindingPorts = Object.values(entry.ports).filter(
        (p) => p.internalPort === internalPort,
      )
      const hasNonSsl = bindingPorts.some((p) => !p.ssl)
      const hasSsl = bindingPorts.some((p) => p.ssl)
      if (hasNonSsl === hasSsl) continue

      let hostname = key
      try {
        const content = await sdk.volumes.i2pd.readFile(
          `${tunnelDir(packageId!, hostId!, key)}/hostname`,
        )
        hostname = content.toString().trim()
      } catch (e: any) {
        if (e?.code !== 'ENOENT') throw e
        // hostname file doesn't exist yet
      }
      variants[key] = {
        name: hostname,
        spec: InputSpec.of({}),
      }
    }

    variants['new'] = {
      name: i18n('Create new address'),
      spec: privateKeySpec,
    }

    return {
      name: i18n('Address'),
      default: 'new',
      disabled: false,
      variants: Variants.of(variants),
    }
  }),
}))

export const addI2pTunnel = sdk.Action.withInput(
  'add-i2p-tunnel',

  async () => ({
    name: i18n('Add I2P Tunnel'),
    description: i18n('Add an I2P tunnel for this URL'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  async ({ effects, prefill }) => {
    const p = prefill as typeof inputSpec._PARTIAL
    let noSsl = false

    const meta = p?.urlPluginMetadata
    if (meta?.packageId && meta.hostId && meta.internalPort != null) {
      const internalPort = meta.internalPort
      noSsl = await sdk.host
        .get(
          effects,
          { hostId: meta.hostId, packageId: meta.packageId },
          (host) => !host?.bindings[internalPort]?.options.addSsl,
        )
        .once()
    }

    return inputSpec.filter(
      {
        ssl: !noSsl,
      },
      true,
    )
  },

  async () => null,

  async ({ effects, input }) => {
    if (!input.urlPluginMetadata) {
      throw new Error('This action must be invoked through the URL plugin')
    }
    const { packageId, hostId, internalPort } = input.urlPluginMetadata
    const address = input.address as {
      selection: string
      value: { privateKey?: string | null }
    }

    // I2P's own interfaces (SOCKS/HTTP proxies, console, transports) are not
    // tunnel targets — assigning an inbound .b32.i2p tunnel to them is nonsensical.
    if (packageId === 'i2pd') {
      throw new Error(
        i18n('I2P proxy interfaces cannot receive I2P tunnel addresses'),
      )
    }

    const host = await sdk.host.get(effects, { hostId, packageId }).once()
    const binding = host?.bindings[internalPort]

    // Build port entry: either SSL or non-SSL based on toggle
    const newPorts: Record<
      string,
      { target: string; ssl: boolean; internalPort: number }
    > = {}

    if (input.ssl && binding?.options.addSsl) {
      const addr = bridgeHost(host, internalPort, true)
      if (addr) {
        newPorts[String(binding.options.addSsl.preferredExternalPort)] = {
          target: `${addr.hostname}:${addr.port}`,
          ssl: true,
          internalPort,
        }
      }
    } else {
      if (binding?.enabled) {
        // A binding that terminates its own TLS (native `secure.ssl`) has no
        // plaintext endpoint, so a non-SSL tunnel can't honestly serve it.
        if (binding.options.secure?.ssl === true) {
          throw new Error(
            `Cannot create a non-SSL I2P tunnel for "${packageId}": its interface is SSL-only. Create an SSL I2P tunnel instead.`,
          )
        }
        const addr = bridgeHost(host, internalPort, false)
        if (addr) {
          newPorts[String(binding.options.preferredExternalPort)] = {
            target: `${addr.hostname}:${addr.port}`,
            ssl: false,
            internalPort,
          }
        }
      } else {
        throw new Error(
          `Cannot create an I2P tunnel for "${packageId}": interface binding ${internalPort} is not exposed, so there is no reachable endpoint to forward to.`,
        )
      }
    }

    // Load current config
    const config = await i2pdConfig.read().once()
    const i2pServices = structuredClone(config?.i2pServices || {})
    if (!i2pServices[packageId]) i2pServices[packageId] = {}
    if (!i2pServices[packageId][hostId]) i2pServices[packageId][hostId] = {}

    const services = i2pServices[packageId][hostId]
    let index: string

    if (address.selection === 'new') {
      index = nextKey(services)
      const tunnelPath = tunnelDir(packageId, hostId, index)
      const keyfileName = `${packageId}-${hostId}-${index}.dat`

      // Generate a new key pair or import an existing one (if privateKey provided).
      // parseI2pKey(null) falls back to generateI2pKey().
      const { keyfile, hostname } = parseI2pKey(
        address.value?.privateKey ?? null,
      )
      await sdk.volumes.i2pd.writeFile(`${tunnelPath}/${keyfileName}`, keyfile)
      await sdk.volumes.i2pd.writeFile(`${tunnelPath}/hostname`, hostname)

      services[index] = { ports: newPorts }
    } else {
      // Reuse existing address
      index = address.selection
      const existing = services[index]
      if (existing) {
        const duplicate = Object.values(existing.ports).some(
          (p) => p.ssl === !!input.ssl && p.internalPort === internalPort,
        )
        if (duplicate) {
          throw new Error(
            input.ssl
              ? i18n(
                  'This I2P address already has an SSL binding for this port',
                )
              : i18n(
                  'This I2P address already has a non-SSL binding for this port',
                ),
          )
        }
        existing.ports = { ...existing.ports, ...newPorts }
      } else {
        services[index] = { ports: newPorts }
      }
    }

    // Build and write the full config in one pass, avoids a second read() call
    // after write() which can race and throw "Unexpected end of JSON input".
    const updatedConfig = {
      i2pServices,
      floodfill: config?.floodfill ?? { enabled: false },
      router: config?.router ?? defaultRouter,
      resetPending: config?.resetPending ?? false,
    }
    await i2pdConfig.write(effects, updatedConfig)
    await sdk.volumes.i2pd.writeFile(
      'etc/i2pd/i2pd.conf',
      generateI2pdConf(updatedConfig),
    )
    await sdk.volumes.i2pd.writeFile(
      'etc/i2pd/tunnels.conf',
      generateTunnelsConf(updatedConfig),
    )
    await reloadI2pdTunnels(effects)
    return null
  },
)
