import {
  defaultRouter,
  i2pdConfig,
  generateI2pdConf,
  generateTunnelsConf,
} from '../fileModels/i2pd'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

const { InputSpec, Value, Variants } = sdk

const inputSpec = InputSpec.of({
  floodfill: Value.toggle({
    name: i18n('Floodfill'),
    description: i18n(
      'Participate as a floodfill router. Requires stable uptime, port forwarding, and at least Standard bandwidth.',
    ),
    default: false,
  }),
  bandwidth: Value.select({
    name: i18n('Bandwidth'),
    description: i18n(
      'Caps the traffic this router relays for other I2P users, never your own, so it costs nothing while Transit Tunnels is disabled.\n- Low: 32 KB/s, too little for Floodfill.\n- Standard: 256 KB/s.\n- High: 2048 KB/s.\n- Unlimited: no cap.',
    ),
    default: 'O',
    values: {
      L: i18n('Low (32 KB/s)'),
      O: i18n('Standard (256 KB/s)'),
      P: i18n('High (2048 KB/s)'),
      X: i18n('Unlimited'),
    },
  }),
  transit: Value.union({
    name: i18n('Transit Tunnels'),
    description: i18n(
      "- Disabled: the router carries only your own services' traffic, and the bandwidth class above costs nothing.\n- Enabled: the router also relays traffic for other I2P users, within the limits below. This helps the network and uses more bandwidth and connections.",
    ),
    default: 'disabled',
    variants: Variants.of({
      disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
      enabled: {
        name: i18n('Enabled'),
        spec: InputSpec.of({
          share: Value.number({
            name: i18n('Share'),
            description: i18n(
              'Percentage of the bandwidth class above offered to relayed traffic.',
            ),
            default: 50,
            required: true,
            min: 1,
            max: 100,
            integer: true,
            units: '%',
          }),
          maxTunnels: Value.number({
            name: i18n('Maximum Transit Tunnels'),
            description: i18n(
              'Upper bound on how many tunnels this router will carry for others at once.',
            ),
            default: 2500,
            required: true,
            min: 2,
            integer: true,
          }),
        }),
      },
    }),
  }),
  loglevel: Value.select({
    name: i18n('Log Level'),
    description: i18n(
      "Warning suits day-to-day use: it records failures and filters out the router's routine network chatter.\n- None: next to nothing is logged, so a failure leaves no trace.\n- Error: errors only.\n- Warning: errors and warnings, minus the known routine chatter.\n- Info: adds routine activity, unfiltered.\n- Debug: everything, unfiltered and very noisy. Turn it on to chase a specific problem, then switch back.",
    ),
    default: 'warn',
    values: {
      none: i18n('None'),
      error: i18n('Error'),
      warn: i18n('Warning'),
      info: i18n('Info'),
      debug: i18n('Debug'),
    },
  }),
  externalHost: Value.text({
    name: i18n('External IP / Hostname'),
    description: i18n(
      'Public IP or hostname for incoming I2P connections. Set to your VPS or port-forwarded router IP to fix double-NAT Symmetric NAT classification. Requires UDP port 4450 forwarded to this machine. Leave blank to auto-detect.',
    ),
    required: false,
    default: null,
    patterns: [],
    minLength: null,
    maxLength: 253,
    placeholder: i18n('e.g. 203.0.113.10 or vpn.example.com'),
  }),
  reseedUrl: Value.text({
    name: i18n('Custom Reseed URL'),
    description: i18n(
      "HTTPS URL of a custom i2p reseed server (su3 format). Set to your own i2pd floodfill node's reseed endpoint to bootstrap the peer pool with known O-type peers from the start. Leave blank to use default reseed servers.",
    ),
    required: false,
    default: null,
    patterns: [
      {
        regex: '^https://',
        description: i18n('Must be an HTTPS URL'),
      },
    ],
    minLength: null,
    maxLength: 2048,
    placeholder: i18n('e.g. https://your-vps.example.com/i2pseeds.su3'),
  }),
})

export const configureRouter = sdk.Action.withInput(
  'configure-router',

  async () => ({
    name: i18n('Configure Router'),
    description: i18n('Configure I2P router settings'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => {
    const config = await i2pdConfig.read().once()
    return {
      floodfill: config?.floodfill?.enabled ?? false,
      bandwidth: config?.router?.bandwidth ?? 'O',
      transit: config?.router?.transit?.enabled
        ? {
            selection: 'enabled' as const,
            value: {
              share: config.router.transit.share,
              maxTunnels: config.router.transit.maxTunnels,
            },
          }
        : { selection: 'disabled' as const, value: {} },
      loglevel: config?.router?.loglevel ?? 'warn',
      externalHost: config?.router?.externalHost ?? null,
      reseedUrl: config?.router?.reseedUrl ?? null,
    }
  },

  async ({ effects, input }) => {
    // Reject floodfill with low bandwidth — it wastes resources without contributing
    if (input.floodfill && input.bandwidth === 'L') {
      return {
        version: '1' as const,
        title: i18n('Cannot Enable Floodfill'),
        message: i18n(
          'Floodfill requires at least Standard (O) bandwidth. Increase the bandwidth setting first.',
        ),
        result: null,
      }
    }

    const config = await i2pdConfig.read().once()

    const updatedConfig = {
      i2pServices: config?.i2pServices ?? {},
      floodfill: { enabled: input.floodfill },
      router: {
        bandwidth: input.bandwidth,
        transit:
          input.transit.selection === 'enabled'
            ? { enabled: true, ...input.transit.value }
            : defaultRouter.transit,
        loglevel: input.loglevel,
        externalHost: input.externalHost ?? undefined,
        reseedUrl: input.reseedUrl ?? undefined,
      },
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
    await effects.restart()
  },
)
