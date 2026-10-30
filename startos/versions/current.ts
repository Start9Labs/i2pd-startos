import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:10',
  releaseNotes: {
    en_US:
      'The instructions cover keeping your home IP private when you publish I2Pd through StartTunnel.',
    es_ES:
      'Las instrucciones explican cómo mantener privada tu IP doméstica cuando publicas I2Pd a través de StartTunnel.',
    de_DE:
      'Die Anleitung erklärt, wie Ihre Heim-IP-Adresse privat bleibt, wenn Sie I2Pd über StartTunnel veröffentlichen.',
    pl_PL:
      'Instrukcje wyjaśniają, jak zachować prywatność domowego adresu IP, gdy publikujesz I2Pd przez StartTunnel.',
    fr_FR:
      'Les instructions expliquent comment garder votre IP personnelle privée lorsque vous publiez I2Pd via StartTunnel.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
