import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.0:0',
  releaseNotes: {
    en_US:
      'Updated i2pd to 3.0.0 with full SAM 3.3 support, faster destination lookups, more reliable UDP tunnels, and fixes for SAM disconnections after reconnecting. New I2P addresses are created with valid keys, existing addresses are left unchanged, and router errors are reported accurately. Private files retain their permissions across restarts. Requires StartOS 0.4.1 or later. Full upstream notes: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 and https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    es_ES:
      'i2pd actualizado a 3.0.0 con soporte completo de SAM 3.3, búsquedas de destinos más rápidas, túneles UDP más fiables y correcciones de desconexiones de SAM tras reconectar. Las nuevas direcciones I2P se crean con claves válidas, las existentes no se modifican y los errores del router se indican correctamente. Los archivos privados conservan sus permisos tras reiniciar. Requiere StartOS 0.4.1 o posterior. Notas completas del proyecto: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 y https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    de_DE:
      'i2pd auf 3.0.0 aktualisiert: vollständige SAM-3.3-Unterstützung, schnellere Zielsuche, zuverlässigere UDP-Tunnel und Behebung von SAM-Verbindungsabbrüchen nach dem Wiederverbinden. Neue I2P-Adressen erhalten gültige Schlüssel, bestehende Adressen bleiben unverändert und Routerfehler werden korrekt gemeldet. Private Dateien behalten ihre Berechtigungen nach Neustarts. Erfordert StartOS 0.4.1 oder neuer. Vollständige Versionshinweise: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 und https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    pl_PL:
      'Zaktualizowano i2pd do 3.0.0: pełna obsługa SAM 3.3, szybsze wyszukiwanie celów, bardziej niezawodne tunele UDP i poprawki rozłączeń SAM po ponownym połączeniu. Nowe adresy I2P otrzymują prawidłowe klucze, istniejące adresy pozostają bez zmian, a błędy routera są poprawnie zgłaszane. Pliki prywatne zachowują uprawnienia po ponownym uruchomieniu. Wymaga StartOS 0.4.1 lub nowszego. Pełne informacje o wydaniach: https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 oraz https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
    fr_FR:
      'i2pd mis à jour vers 3.0.0 : prise en charge complète de SAM 3.3, recherches de destinations plus rapides, tunnels UDP plus fiables et correction des déconnexions SAM après reconnexion. Les nouvelles adresses I2P reçoivent des clés valides, les adresses existantes restent inchangées et les erreurs du routeur sont correctement signalées. Les fichiers privés conservent leurs permissions après redémarrage. Nécessite StartOS 0.4.1 ou ultérieur. Notes de version complètes : https://github.com/PurpleI2P/i2pd/releases/tag/2.61.0 et https://github.com/PurpleI2P/i2pd/releases/tag/3.0.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
