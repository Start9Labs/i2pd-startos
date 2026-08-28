import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import {
  I2PCONTROL_PASSWORD,
  consolePort,
  i2pControlPort,
  samPort,
  socksPort,
} from '../utils'

const portInfoShape = z.object({
  target: z.string(),
  ssl: z.boolean(),
  internalPort: z.number(),
})

export const i2pServiceEntryShape = z.object({
  ports: z.record(z.string(), portInfoShape),
})

export const floodfillShape = z.object({
  enabled: z.boolean().catch(false),
})

export const transitShape = z.object({
  enabled: z.boolean().catch(false),
  /** Percent of `bandwidth` offered to transit. */
  share: z.number().int().min(1).max(100).catch(50),
  /** i2pd floors `limits.transittunnels` at 2; a lower value here would not bind. */
  maxTunnels: z.number().int().min(2).catch(2500),
})

export const routerShape = z.object({
  bandwidth: z.enum(['L', 'O', 'P', 'X']).catch('O'),
  transit: transitShape.catch({ enabled: false, share: 50, maxTunnels: 2500 }),
  loglevel: z.enum(['none', 'error', 'warn', 'info', 'debug']).catch('warn'),
  // Peer-test detection always lands on "Symmetric NAT" under the bridge's MASQUERADE.
  externalHost: z
    .string()
    .regex(/^[^\n\r]*$/)
    .optional()
    .catch(undefined),
  reseedUrl: z.string().url().optional().catch(undefined),
})

const shape = z.object({
  i2pServices: z
    .record(
      z.string(),
      z.record(z.string(), z.record(z.string(), i2pServiceEntryShape)),
    )
    .catch({}),
  floodfill: floodfillShape.catch({
    enabled: false,
  }),
  router: routerShape.catch({
    bandwidth: 'O',
    transit: { enabled: false, share: 50, maxTunnels: 2500 },
    loglevel: 'warn',
  }),
  // Applied by main before any daemon exists: a running router would rewrite
  // netDb and peerProfiles straight back out of memory.
  resetPending: z.boolean().catch(false),
})

/** The router defaults, for a caller rebuilding the whole config in one write. */
export const defaultRouter: z.infer<typeof routerShape> = {
  bandwidth: 'O',
  transit: { enabled: false, share: 50, maxTunnels: 2500 },
  loglevel: 'warn',
}

export type I2pdConfig = z.infer<typeof shape>

export function tunnelDir(packageId: string, hostId: string, index: string) {
  return `tunnels/${packageId}/${hostId}/tunnel_${index}`
}

/** Never reuses a gap: a key names a tunnel directory holding key material. */
export function nextKey(record: Record<string, unknown>): string {
  return String(
    Object.keys(record)
      .map(Number)
      .filter((n) => !isNaN(n))
      .reduce((acc, x) => (x >= acc ? x + 1 : acc), 0),
  )
}

/** Parses through Zod before emitting, so a corrupt value cannot reach i2pd. */
export function generateI2pdConf(config: I2pdConfig): string {
  const router = routerShape.parse(config.router)
  const ff = floodfillShape.parse(config.floodfill)

  const lines: string[] = [
    '# i2pd configuration',
    // Tunnels conf lives in the volume so hot-reloads via the HTTP API work.
    'tunconf = /var/lib/i2pd/etc/i2pd/tunnels.conf',
    '',
    `loglevel = ${router.loglevel}`,
  ]

  // Always emitted: i2pd's own fallback is 'L', not the 'O' this shape defaults to.
  lines.push(`bandwidth = ${router.bandwidth}`)

  // Every other transit knob is a cap on relayed traffic, so none can express "none".
  if (router.transit.enabled) {
    lines.push(`share = ${router.transit.share}`)
  } else {
    lines.push('notransit = true')
  }

  if (router.externalHost) {
    lines.push(`host = ${router.externalHost}`)
  }

  if (ff.enabled) {
    lines.push('floodfill = true')
  }

  // The container holds only link-local/ULA IPv6, so an IPv6-only peer never connects.
  lines.push('nat = true')
  lines.push('ipv4 = true')
  lines.push('ipv6 = false')
  lines.push('')

  lines.push('# Web console (also used for internal health checks)')
  lines.push('[http]')
  lines.push('enabled = true')
  // The StartOS proxy runs outside this subcontainer, so loopback is unreachable.
  lines.push('address = 0.0.0.0')
  lines.push(`port = ${consolePort}`)
  // The proxy forwards its own Host header, which the strict-headers check 403s.
  lines.push('strictheaders = false')
  lines.push('')

  lines.push('[httpproxy]')
  lines.push('enabled = true')
  lines.push('address = 0.0.0.0')
  lines.push('port = 4444')
  lines.push('')

  lines.push('[socksproxy]')
  lines.push('enabled = true')
  lines.push('address = 0.0.0.0')
  lines.push(`port = ${socksPort}`)
  lines.push('')

  lines.push('[ssu2]')
  lines.push('enabled = true')
  // Unset, i2pd picks a fresh random port per start, which no forward can follow.
  lines.push('port = 4450')
  lines.push('')

  lines.push('[ntcp2]')
  lines.push('enabled = true')
  lines.push('port = 4451')
  lines.push('')

  // One hop rather than the default two: netDb lookups survive NAT far better.
  lines.push('[exploratory]')
  lines.push('inbound.length = 1')
  lines.push('outbound.length = 1')
  lines.push('inbound.quantity = 3')
  lines.push('outbound.quantity = 3')
  lines.push('')

  // The container's gateway is the LXC bridge, so SSDP never reaches the router.
  lines.push('[upnp]')
  lines.push('enabled = false')
  lines.push('')

  // Skew past a few seconds makes floodfills silently reject our LeaseSets.
  lines.push('[nettime]')
  lines.push('enabled = true')
  lines.push('frompeers = true')
  lines.push('')

  if (router.reseedUrl) {
    lines.push('[reseed]')
    lines.push(`urls = ${router.reseedUrl}`)
    lines.push('verify = true')
    lines.push('')
  }

  lines.push('[sam]')
  lines.push('enabled = true')
  // interfaces.ts binds this without exporting one, which is what keeps it off the LAN.
  lines.push('address = 0.0.0.0')
  lines.push(`port = ${samPort}`)
  lines.push('')

  // i2pd never validates the token it issues (PurpleI2P/i2pd#2138) — loopback only.
  lines.push('[i2pcontrol]')
  lines.push('enabled = true')
  lines.push('address = 127.0.0.1')
  lines.push(`port = ${i2pControlPort}`)
  lines.push(`password = ${I2PCONTROL_PASSWORD}`)
  lines.push('')

  if (router.transit.enabled) {
    lines.push('[limits]')
    lines.push(`transittunnels = ${router.transit.maxTunnels}`)
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generates the tunnels.conf file with server tunnel definitions.
 *
 * i2pd server tunnels accept exactly one `inport` per [section].
 * When a service has multiple external ports (e.g. HTTP port 80 + SSL port
 * 443), each port gets its own [section] that references the same .dat keys
 * file — so they all share the same .b32.i2p destination address.
 */
export function generateTunnelsConf(config: I2pdConfig): string {
  const lines: string[] = ['# i2pd server tunnels', '']

  for (const [packageId, hosts] of Object.entries(config.i2pServices)) {
    for (const [hostId, services] of Object.entries(hosts)) {
      for (const [index, svc] of Object.entries(services)) {
        if (Object.keys(svc.ports).length === 0) continue

        const baseName = `${packageId}-${hostId}-${index}`
        const keyPath = `${tunnelDir(packageId, hostId, index)}/${baseName}.dat`

        for (const [externalPort, portInfo] of Object.entries(svc.ports)) {
          const sectionName = `${baseName}-p${externalPort}`
          const colonIdx = portInfo.target.lastIndexOf(':')
          const host = portInfo.target.slice(0, colonIdx)
          const port = portInfo.target.slice(colonIdx + 1)

          lines.push(`# @service ${packageId} ${hostId}`)
          if (portInfo.ssl) lines.push(`# @ssl ${portInfo.internalPort}`)
          lines.push(`[${sectionName}]`)
          lines.push('type = server')
          lines.push(`keys = ${keyPath}`)
          lines.push(`host = ${host}`)
          lines.push(`port = ${port}`)
          lines.push(`inport = ${externalPort}`)
          // Never 0: that makes this firewalled router the gateway, and nobody can reach it.
          lines.push('inbound.length = 1')
          lines.push('outbound.length = 1')
          // A wide draw, so at least one gateway is likely to be directly reachable.
          lines.push('inbound.quantity = 10')
          lines.push('outbound.quantity = 5')
          lines.push('')
        }
      }
    }
  }

  return lines.join('\n')
}

export const i2pdConfig = FileHelper.json(
  { base: sdk.volumes.i2pd, subpath: 'config.json' },
  shape,
)
