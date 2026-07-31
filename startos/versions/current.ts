import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:4',
  releaseNotes: {
    en_US: `The SAM API (port 7656) now listens on the host bridge instead of loopback, so other services on your server can reach it. It is not exported as a service interface, so it remains unreachable from the LAN, clearnet, or Tor.`,
    es_ES: `La API SAM (puerto 7656) ahora escucha en el puente del host en lugar de en loopback, para que otros servicios de su servidor puedan alcanzarla. No se exporta como interfaz de servicio, por lo que sigue siendo inaccesible desde la LAN, la red abierta o Tor.`,
    de_DE: `Die SAM-API (Port 7656) lauscht jetzt auf der Host-Bridge statt auf Loopback, sodass andere Dienste auf Ihrem Server sie erreichen können. Sie wird nicht als Dienstschnittstelle exportiert und bleibt daher aus dem LAN, dem Clearnet und über Tor unerreichbar.`,
    pl_PL: `API SAM (port 7656) nasłuchuje teraz na mostku hosta zamiast na pętli zwrotnej, dzięki czemu inne usługi na serwerze mogą się z nim połączyć. Nie jest eksportowane jako interfejs usługi, więc pozostaje nieosiągalne z sieci LAN, clearnetu i Tora.`,
    fr_FR: `L'API SAM (port 7656) écoute désormais sur le pont de l'hôte au lieu de la boucle locale, afin que les autres services de votre serveur puissent l'atteindre. Elle n'est pas exportée comme interface de service et reste donc inaccessible depuis le réseau local, le clearnet ou Tor.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
