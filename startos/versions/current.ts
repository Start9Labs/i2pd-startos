import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:7',
  releaseNotes: {
    en_US: `I2Pd now ships from the Start9 Registry and is maintained by Start9.`,
    es_ES: `I2Pd ahora se publica en el Registro de Start9 y su mantenimiento corre a cargo de Start9.`,
    de_DE: `I2Pd wird jetzt über die Start9-Registry veröffentlicht und von Start9 gepflegt.`,
    pl_PL: `I2Pd jest teraz publikowany w rejestrze Start9 i utrzymywany przez Start9.`,
    fr_FR: `I2Pd est désormais publié dans le registre Start9 et maintenu par Start9.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
