import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:8',
  releaseNotes: {
    en_US: `I2Pd now ships from the Start9 Registry and is maintained by Start9.

- Uninstalling a service that has an I2P address leaves every other service's I2P addresses in place.
- Configure Router's Bandwidth, Transit Tunnels and Log Level settings explain each option, and the High bandwidth class shows its rate, 2048 KB/s.
- Add I2P Tunnel's SSL and Address fields explain what each choice does.
- Removing an I2P address says when the address will be lost for good.`,
    es_ES: `I2Pd ahora se publica en el Registro de Start9 y su mantenimiento corre a cargo de Start9.

- Desinstalar un servicio que tiene una dirección I2P deja intactas las direcciones I2P de todos los demás servicios.
- Los ajustes Ancho de banda, Túneles de tránsito y Nivel de registro de Configurar Router explican cada opción, y la clase de ancho de banda Alto muestra su velocidad, 2048 KB/s.
- Los campos SSL y Dirección de Agregar túnel I2P explican qué hace cada opción.
- Al eliminar una dirección I2P se indica cuándo la dirección se perderá para siempre.`,
    de_DE: `I2Pd wird jetzt über die Start9-Registry veröffentlicht und von Start9 gepflegt.

- Das Deinstallieren eines Dienstes mit einer I2P-Adresse lässt die I2P-Adressen aller anderen Dienste unverändert.
- Die Einstellungen Bandbreite, Transit-Tunnel und Protokollebene in „Router konfigurieren“ erklären jede Option, und die Bandbreitenklasse Hoch zeigt ihre Rate, 2048 KB/s.
- Die Felder SSL und Adresse in „I2P-Tunnel hinzufügen“ erklären, was jede Wahl bewirkt.
- Beim Entfernen einer I2P-Adresse wird angegeben, wann die Adresse endgültig verloren geht.`,
    pl_PL: `I2Pd jest teraz publikowany w rejestrze Start9 i utrzymywany przez Start9.

- Odinstalowanie usługi, która ma adres I2P, pozostawia adresy I2P wszystkich pozostałych usług bez zmian.
- Ustawienia Przepustowość, Tunele tranzytowe i Poziom logowania w „Konfiguruj Router” objaśniają każdą opcję, a klasa przepustowości Wysoka pokazuje swoją prędkość, 2048 KB/s.
- Pola SSL i Adres w „Dodaj tunel I2P” objaśniają, co robi każdy wybór.
- Usuwanie adresu I2P informuje, kiedy adres zostanie utracony na zawsze.`,
    fr_FR: `I2Pd est désormais publié dans le registre Start9 et maintenu par Start9.

- Désinstaller un service qui possède une adresse I2P laisse intactes les adresses I2P de tous les autres services.
- Les réglages Bande passante, Tunnels de transit et Niveau de journalisation de Configurer le routeur expliquent chaque option, et la classe de bande passante Élevée affiche son débit, 2048 Ko/s.
- Les champs SSL et Adresse d'Ajouter un tunnel I2P expliquent l'effet de chaque choix.
- La suppression d'une adresse I2P indique quand l'adresse sera perdue définitivement.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
