import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('i2pd').setOptions({
    // Everything the router rebuilds by reseeding. What is left — `config.json`,
    // `router.keys`, and every key under `tunnels/` — is the irreplaceable part:
    // a `.b32.i2p` is derived from its tunnel key, so a backup without it cannot
    // bring the address back.
    exclude: [
      'addressbook/',
      'certificates/',
      'netDb/',
      'peerProfiles/',
      'tags/',
      'i2pd.pid',
      'router.info',
    ],
  }),
)
