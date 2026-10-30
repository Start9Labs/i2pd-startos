import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:10',
  releaseNotes: {
    en_US:
      'Updated the StartOS integration and clarified how to route outbound I2P traffic through StartTunnel.',
    es_ES:
      'Se actualizó la integración con StartOS y se aclaró cómo enrutar el tráfico I2P saliente a través de StartTunnel.',
    de_DE:
      'Die StartOS-Integration wurde aktualisiert und die Anleitung zum Weiterleiten ausgehenden I2P-Verkehrs über StartTunnel präzisiert.',
    pl_PL:
      'Zaktualizowano integrację ze StartOS i wyjaśniono, jak kierować wychodzący ruch I2P przez StartTunnel.',
    fr_FR:
      "L’intégration à StartOS a été mise à jour et les instructions pour acheminer le trafic I2P sortant via StartTunnel ont été précisées.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
