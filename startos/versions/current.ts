import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:5',
  releaseNotes: {
    en_US: `Transit relaying off by default, a health check that reports the network, and a quieter log.

- Transit relaying is now off by default, so the router carries only your own services' traffic. This update turns it off on existing installs; turn it back on under Configure Router, where you can now also cap the share of bandwidth and the number of transit tunnels it uses.
- The health check reports the router's integration with the I2P network, and names the fault when a router will not recover on its own.
- The service log no longer carries the router's routine network chatter.
- New action: Reset Router clears the router's cached view of the network and restarts so it finds peers from scratch. Your .b32.i2p addresses and the router identity are not affected.
- Backups leave out what the router rebuilds by reseeding and are much smaller. Tunnel keys are still included.`,
    es_ES: `Retransmisión de tránsito desactivada por defecto, una comprobación de estado que informa de la red y un registro más limpio.

- La retransmisión de tránsito ahora está desactivada por defecto, así que el enrutador solo transporta el tráfico de sus propios servicios. Esta actualización la desactiva en las instalaciones existentes; vuelva a activarla en Configurar Router, donde ahora también puede limitar la proporción de ancho de banda y el número de túneles de tránsito que usa.
- La comprobación de estado informa de la integración del enrutador con la red I2P y señala el fallo cuando un enrutador no se va a recuperar por sí solo.
- El registro del servicio ya no incluye el parloteo de red rutinario del enrutador.
- Nueva acción: Restablecer enrutador borra la vista en caché que el enrutador tiene de la red y lo reinicia para que encuentre pares desde cero. Sus direcciones .b32.i2p y la identidad del enrutador no se ven afectadas.
- Las copias de seguridad omiten lo que el enrutador reconstruye al resembrar y son mucho más pequeñas. Las claves de los túneles siguen incluidas.`,
    de_DE: `Transit-Weiterleitung standardmäßig aus, eine Statusprüfung, die das Netzwerk meldet, und ein ruhigeres Protokoll.

- Die Transit-Weiterleitung ist jetzt standardmäßig aus, sodass der Router nur den Verkehr Ihrer eigenen Dienste trägt. Dieses Update schaltet sie auf bestehenden Installationen ab; schalten Sie sie unter Router konfigurieren wieder ein, wo Sie nun auch den Bandbreitenanteil und die Anzahl der Transit-Tunnel begrenzen können.
- Die Statusprüfung meldet die Integration des Routers in das I2P-Netzwerk und benennt den Fehler, wenn ein Router sich nicht von selbst erholt.
- Das Dienstprotokoll enthält das alltägliche Netzwerk-Geplapper des Routers nicht mehr.
- Neue Aktion: Router zurücksetzen löscht die zwischengespeicherte Sicht des Routers auf das Netzwerk und startet ihn neu, damit er Peers von Grund auf neu findet. Ihre .b32.i2p-Adressen und die Router-Identität sind nicht betroffen.
- Sicherungen lassen aus, was der Router durch Reseeding neu aufbaut, und sind deutlich kleiner. Tunnel-Schlüssel sind weiterhin enthalten.`,
    pl_PL: `Przekazywanie ruchu tranzytowego domyślnie wyłączone, kontrola stanu raportująca sieć i spokojniejszy dziennik.

- Przekazywanie ruchu tranzytowego jest teraz domyślnie wyłączone, więc router przenosi wyłącznie ruch Twoich własnych usług. Ta aktualizacja wyłącza je w istniejących instalacjach; włącz je ponownie w Konfiguracji routera, gdzie możesz teraz także ograniczyć udział przepustowości oraz liczbę tuneli tranzytowych.
- Kontrola stanu raportuje integrację routera z siecią I2P i wskazuje usterkę, gdy router nie odzyska sprawności samodzielnie.
- Dziennik usługi nie zawiera już rutynowych komunikatów sieciowych routera.
- Nowa akcja: Zresetuj router czyści zapisany obraz sieci i restartuje router, aby znalazł węzły od nowa. Twoje adresy .b32.i2p oraz tożsamość routera pozostają nienaruszone.
- Kopie zapasowe pomijają dane, które router odbudowuje przez reseed, i są znacznie mniejsze. Klucze tuneli są nadal uwzględniane.`,
    fr_FR: `Relais de transit désactivé par défaut, une vérification d'état qui rend compte du réseau, et un journal plus calme.

- Le relais de transit est désormais désactivé par défaut : le routeur ne transporte que le trafic de vos propres services. Cette mise à jour le désactive sur les installations existantes ; réactivez-le dans Configurer le routeur, où vous pouvez maintenant aussi limiter la part de bande passante et le nombre de tunnels de transit utilisés.
- La vérification d'état rend compte de l'intégration du routeur au réseau I2P et nomme la panne lorsqu'un routeur ne se rétablira pas de lui-même.
- Le journal du service ne contient plus le bavardage réseau ordinaire du routeur.
- Nouvelle action : Réinitialiser le routeur efface la vue en cache du réseau et redémarre, afin que le routeur retrouve des pairs de zéro. Vos adresses .b32.i2p et l'identité du routeur ne sont pas affectées.
- Les sauvegardes omettent ce que le routeur reconstruit par réamorçage et sont bien plus petites. Les clés de tunnel restent incluses.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
