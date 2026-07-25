import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:3',
  releaseNotes: {
    en_US: `Updated to the StartOS 2.0 SDK (requires StartOS 0.4.0-beta.10). I2P tunnels now reach their target apps over the internal LXC bridge instead of deprecated container hostnames, and the StartOS admin UI is addressed like any other service — repairing tunnel routing and preventing other services from restarting whenever I2P is installed, updated, or removed.`,
    es_ES: `Actualizado al SDK 2.0 de StartOS (requiere StartOS 0.4.0-beta.10). Los túneles I2P ahora alcanzan sus aplicaciones de destino a través del puente LXC interno en lugar de nombres de host de contenedor obsoletos, y la interfaz de administración de StartOS se direcciona como cualquier otro servicio, reparando el enrutamiento de túneles y evitando que otros servicios se reinicien cuando se instala, actualiza o elimina I2P.`,
    de_DE: `Auf das StartOS-2.0-SDK aktualisiert (erfordert StartOS 0.4.0-beta.10). I2P-Tunnel erreichen ihre Ziel-Apps jetzt über die interne LXC-Bridge statt über veraltete Container-Hostnamen, und die StartOS-Verwaltungsoberfläche wird wie jeder andere Dienst adressiert — das repariert das Tunnel-Routing und verhindert, dass andere Dienste neu starten, wenn I2P installiert, aktualisiert oder entfernt wird.`,
    pl_PL: `Zaktualizowano do SDK StartOS 2.0 (wymaga StartOS 0.4.0-beta.10). Tunele I2P docierają teraz do docelowych aplikacji przez wewnętrzny mostek LXC zamiast przestarzałych nazw hostów kontenerów, a interfejs administracyjny StartOS jest adresowany jak każda inna usługa — naprawia to routing tuneli i zapobiega restartowaniu innych usług przy instalacji, aktualizacji lub usunięciu I2P.`,
    fr_FR: `Mise à jour vers le SDK StartOS 2.0 (nécessite StartOS 0.4.0-beta.10). Les tunnels I2P atteignent désormais leurs applications cibles via le pont LXC interne au lieu de noms d'hôtes de conteneurs obsolètes, et l'interface d'administration de StartOS est adressée comme n'importe quel autre service — ce qui répare le routage des tunnels et empêche d'autres services de redémarrer lors de l'installation, de la mise à jour ou de la suppression d'I2P.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
