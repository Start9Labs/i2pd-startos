import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { i2pdConfig, tunnelDir } from '../fileModels/i2pd'
import { sdk } from '../sdk'
import { generateI2pKey, lacksSigningKey } from '../utils'

export const current = VersionInfo.of({
  version: '3.0.0:0',
  releaseNotes: {
    en_US:
      "Updated i2pd to 3.0.0 with full SAM 3.3 support, faster destination lookups, more reliable UDP tunnels, and fixes for SAM disconnections after reconnecting. I2P addresses created by earlier versions are replaced with working ones; share the new address shown in each service's Interfaces tab. Router errors are reported accurately. Private files retain their permissions across restarts. Requires StartOS 0.4.1 or later. Full upstream notes: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 and https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0",
    es_ES:
      'i2pd actualizado a 3.0.0 con soporte completo de SAM 3.3, búsquedas de destinos más rápidas, túneles UDP más fiables y correcciones de desconexiones de SAM tras reconectar. Las direcciones I2P creadas por versiones anteriores se sustituyen por otras que funcionan; comparta la nueva dirección que aparece en la pestaña Interfaces de cada servicio. Los errores del router se indican correctamente. Los archivos privados conservan sus permisos tras reiniciar. Requiere StartOS 0.4.1 o posterior. Notas completas del proyecto: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 y https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    de_DE:
      'i2pd auf 3.0.0 aktualisiert: vollständige SAM-3.3-Unterstützung, schnellere Zielsuche, zuverlässigere UDP-Tunnel und Behebung von SAM-Verbindungsabbrüchen nach dem Wiederverbinden. Von früheren Versionen erstellte I2P-Adressen werden durch funktionierende ersetzt; teilen Sie die neue Adresse aus dem Reiter Interfaces des jeweiligen Dienstes. Routerfehler werden korrekt gemeldet. Private Dateien behalten ihre Berechtigungen nach Neustarts. Erfordert StartOS 0.4.1 oder neuer. Vollständige Versionshinweise: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 und https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    pl_PL:
      'Zaktualizowano i2pd do 3.0.0: pełna obsługa SAM 3.3, szybsze wyszukiwanie celów, bardziej niezawodne tunele UDP i poprawki rozłączeń SAM po ponownym połączeniu. Adresy I2P utworzone przez wcześniejsze wersje zostają zastąpione działającymi; udostępnij nowy adres widoczny na karcie Interfaces każdej usługi. Błędy routera są poprawnie zgłaszane. Pliki prywatne zachowują uprawnienia po ponownym uruchomieniu. Wymaga StartOS 0.4.1 lub nowszego. Pełne informacje o wydaniach: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 oraz https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    fr_FR:
      "i2pd mis à jour vers 3.0.0 : prise en charge complète de SAM 3.3, recherches de destinations plus rapides, tunnels UDP plus fiables et correction des déconnexions SAM après reconnexion. Les adresses I2P créées par les versions précédentes sont remplacées par des adresses fonctionnelles ; partagez la nouvelle adresse affichée dans l'onglet Interfaces de chaque service. Les erreurs du routeur sont correctement signalées. Les fichiers privés conservent leurs permissions après redémarrage. Nécessite StartOS 0.4.1 ou ultérieur. Notes de version complètes : https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 et https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0",
  },
  migrations: {
    up: async ({ effects }) => {
      const config = await i2pdConfig.read().once()
      for (const [packageId, hosts] of Object.entries(
        config?.i2pServices ?? {},
      ))
        for (const [hostId, services] of Object.entries(hosts ?? {}))
          for (const index of Object.keys(services ?? {})) {
            const dir = tunnelDir(packageId, hostId, index)
            const keyPath = `${dir}/${packageId}-${hostId}-${index}.dat`
            const keyfile = await sdk.volumes.i2pd
              .readFile(keyPath)
              .catch(() => null)
            if (!Buffer.isBuffer(keyfile) || !lacksSigningKey(keyfile)) continue
            const fresh = generateI2pKey()
            await sdk.volumes.i2pd.writeFile(keyPath, fresh.keyfile)
            await sdk.volumes.i2pd.writeFile(`${dir}/hostname`, fresh.hostname)
          }
    },
    down: IMPOSSIBLE,
  },
})
