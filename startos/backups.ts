import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('i2pd').setOptions({
    // Everything the router rebuilds by reseeding. What is left — `config.json`,
    // `router.keys`, and every key under `tunnels/` — is the irreplaceable part:
    // a `.b32.i2p` is derived from its tunnel key, so a backup without it cannot
    // bring the address back.
    //
    // `router.info` is derived from `router.keys` but is kept anyway: restoring
    // keys without it lands i2pd on a "malformed, creating new" path that emits
    // one Identity parse error per netDb entry before it recovers.
    exclude: [
      'addressbook/',
      'certificates/',
      'netDb/',
      'peerProfiles/',
      'tags/',
      'i2pd.pid',
    ],
  }),
)
