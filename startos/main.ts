import { healthFns } from '@start9labs/start-sdk'
import { request } from 'node:https'
import { rm } from 'node:fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  i2pdConfig,
  generateI2pdConf,
  generateTunnelsConf,
} from './fileModels/i2pd'
import { CHURN_FAMILY_COUNT, i2pdLogFilter } from './i2pdLogFilter'
import { i2pControlPort } from './utils'

/**
 * I2PControl JSON-RPC, over the loopback address the generated conf binds it
 * to. Self-signed cert, and no Authenticate round-trip: i2pd never validates
 * the token it issues (PurpleI2P/i2pd#2138), while a `Token` field on a
 * RouterInfo call is one i2pd logs an error for. If it ever starts validating,
 * every reply becomes an error object, which the check below reads as "no
 * answer yet" rather than success.
 */
const i2pControlRpc = (method: string, params: Record<string, unknown>) =>
  new Promise<any>((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    const req = request(
      {
        hostname: '127.0.0.1',
        port: i2pControlPort,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk: string) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            reject(new Error('Invalid JSON'))
          }
        })
      },
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })

/**
 * The router's own account of its network integration. Past the grace period
 * the states that will not resolve on their own report `failure` and say what
 * is wrong, so "still starting" cannot mean "never".
 */
async function checkRouter(): Promise<healthFns.HealthCheckResult> {
  try {
    const info = await i2pControlRpc('RouterInfo', {
      'i2p.router.net.status': null,
      'i2p.router.netdb.knownpeers': null,
      'i2p.router.netdb.activepeers': null,
    })
    const netStatus = info?.result?.['i2p.router.net.status']
    const knownPeers = info?.result?.['i2p.router.netdb.knownpeers']
    const activePeers = info?.result?.['i2p.router.netdb.activepeers']

    // A reply without a usable `result` carries no numbers, and every
    // comparison below is false against undefined — fail toward `starting`
    // rather than reporting success on a router that said nothing.
    if (info?.result == null || netStatus == null) {
      return {
        result: 'starting',
        message: i18n('Starting the I2P router'),
      }
    }

    // An empty netDb means reseed never landed — the router has nothing to
    // connect to and will not recover on its own. It reseeds over HTTPS by
    // hostname, so the usual cause is that the server cannot resolve names.
    if (knownPeers <= 1) {
      return {
        result: 'failure',
        message: i18n(
          'No peers found. The router could not reach a reseed server, which usually means this server cannot resolve DNS. Check System > DNS Servers.',
        ),
      }
    }

    // net.status 0-7 are operational (OK, testing, firewalled, hidden,
    // warnings); 8+ are errors (I2CP, clock skew, no peers, and the rest).
    if (netStatus >= 8) {
      return {
        result: 'failure',
        message: i18n('The I2P router reported error status ${status}', {
          status: String(netStatus),
        }),
      }
    }

    // Reseeded, but no tunnels yet — this one does resolve itself.
    if (activePeers === 0) {
      return {
        result: 'starting',
        message: i18n('Building the network database'),
      }
    }

    return {
      result: 'success',
      message: i18n('Integrated with the I2P network (${peers} active peers)', {
        peers: String(activePeers),
      }),
    }
  } catch {
    return {
      result: 'starting',
      message: i18n('Starting the I2P router'),
    }
  }
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting I2Pd!')

  // Re-sync conf files to the volume on every start so they always reflect the
  // current config.json.  Actions (addI2pTunnel, deleteI2pTunnel, etc.) also
  // write here, and i2pd is pointed at these paths via --conf, so hot-reload
  // (reloadI2pdTunnels) picks up the latest tunnels.conf without a restart.
  const config = await i2pdConfig.read().once()

  // Queued by the Reset Router action, applied here because no daemon exists
  // yet. Deny-list rather than allow-list: `tunnels/` holds the key material
  // behind every issued .b32.i2p, and `router.keys` is this router's identity.
  if (config?.resetPending) {
    for (const path of ['netDb', 'peerProfiles', 'router.info']) {
      await rm(sdk.volumes.i2pd.subpath(path), { recursive: true, force: true })
    }
    await i2pdConfig.merge(effects, { resetPending: false })
    console.info('Router network database cleared; reseeding from scratch')
  }

  if (config) {
    await sdk.volumes.i2pd.writeFile(
      'etc/i2pd/i2pd.conf',
      generateI2pdConf(config),
    )
    await sdk.volumes.i2pd.writeFile(
      'etc/i2pd/tunnels.conf',
      generateTunnelsConf(config),
    )
  }

  const i2pdSub = sdk.SubContainer.of(
    effects,
    { imageId: 'i2pd' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'i2pd',
      subpath: null,
      mountpoint: '/var/lib/i2pd',
      readonly: false,
    }),
    'i2pd-sub',
  )

  const filterLog = (config?.router?.loglevel ?? 'warn') === 'warn'
  if (filterLog) {
    // One line per start so a support reader can tell the filter is engaged,
    // and how big the drop list was, without reading source.
    console.info(
      `i2pd log filter active: ${CHURN_FAMILY_COUNT} known-weather families`,
    )
  }

  return sdk.Daemons.of(effects)
    .addOneshot('fix-perms', {
      subcontainer: i2pdSub,
      exec: {
        command: [
          'sh',
          '-c',
          'chmod -R 755 /var/lib/i2pd && chown -R i2pd:i2pd /var/lib/i2pd && [ -e /var/lib/i2pd/certificates ] || ln -s /usr/share/i2pd/certificates /var/lib/i2pd/certificates',
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('i2pd', {
      subcontainer: i2pdSub,
      exec: {
        command: [
          'i2pd',
          '--conf=/var/lib/i2pd/etc/i2pd/i2pd.conf',
          '--datadir=/var/lib/i2pd',
        ],
        // Drop the router's known network-weather lines (see i2pdLogFilter.ts).
        // Both callbacks or neither: supplying either one switches the child's
        // stdio to pipes — all three streams, stdin included — and a pipe
        // nothing reads blocks i2pd once 64 KiB backs up.
        ...(filterLog
          ? {
              onStdout: i2pdLogFilter(process.stdout),
              onStderr: i2pdLogFilter(process.stderr),
            }
          : {}),
      },
      ready: {
        display: i18n('I2P Network'),
        gracePeriod: 5 * 60 * 1000,
        fn: checkRouter,
      },
      requires: ['fix-perms'],
    })
})
