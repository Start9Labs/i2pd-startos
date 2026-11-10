import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.0:1',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.1 or later. The router now connects to I2P peers over IPv6 as well as IPv4, and the HTTP proxy accepts connections on your server’s IPv6 addresses. A new Transport Gateway health check fails when the router’s outbound traffic leaves through a gateway its ports aren’t exposed on.',
    es_ES:
      'Requiere StartOS 0.4.1 o posterior. El router ahora se conecta con pares I2P por IPv6 además de IPv4, y el proxy HTTP acepta conexiones en las direcciones IPv6 de su servidor. Una nueva comprobación de estado, Puerta de enlace de transporte, falla cuando el tráfico saliente del router sale por una puerta de enlace distinta de aquella en la que están expuestos sus puertos.',
    de_DE:
      'Erfordert StartOS 0.4.1 oder neuer. Der Router verbindet sich jetzt über IPv6 sowie IPv4 mit I2P-Peers, und der HTTP-Proxy nimmt Verbindungen über die IPv6-Adressen Ihres Servers an. Eine neue Zustandsprüfung „Transport-Gateway“ schlägt fehl, wenn der ausgehende Datenverkehr des Routers über ein anderes Gateway läuft als das, auf dem seine Ports freigegeben sind.',
    pl_PL:
      'Wymaga StartOS 0.4.1 lub nowszego. Router łączy się teraz z peerami I2P przez IPv6 oraz IPv4, a proxy HTTP przyjmuje połączenia na adresach IPv6 twojego serwera. Nowa kontrola stanu „Brama transportu” zgłasza błąd, gdy ruch wychodzący routera opuszcza serwer przez inną bramę niż ta, na której udostępniono jego porty.',
    fr_FR:
      'Nécessite StartOS 0.4.1 ou ultérieur. Le routeur se connecte désormais aux pairs I2P en IPv6 comme en IPv4, et le proxy HTTP accepte les connexions sur les adresses IPv6 de votre serveur. Une nouvelle vérification d’état, Passerelle de transport, échoue lorsque le trafic sortant du routeur passe par une autre passerelle que celle sur laquelle ses ports sont exposés.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
