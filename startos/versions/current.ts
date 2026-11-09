import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.0:1',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.1 or later. The router now connects to I2P peers over IPv6 as well as IPv4, and the HTTP and SOCKS proxies accept connections on your server’s IPv6 addresses.',
    es_ES:
      'Requiere StartOS 0.4.1 o posterior. El router ahora se conecta con pares I2P por IPv6 además de IPv4, y los proxies HTTP y SOCKS aceptan conexiones en las direcciones IPv6 de su servidor.',
    de_DE:
      'Erfordert StartOS 0.4.1 oder neuer. Der Router verbindet sich jetzt über IPv6 sowie IPv4 mit I2P-Peers, und die HTTP- und SOCKS-Proxys nehmen Verbindungen über die IPv6-Adressen Ihres Servers an.',
    pl_PL:
      'Wymaga StartOS 0.4.1 lub nowszego. Router łączy się teraz z peerami I2P przez IPv6 oraz IPv4, a proxy HTTP i SOCKS przyjmują połączenia na adresach IPv6 twojego serwera.',
    fr_FR:
      'Nécessite StartOS 0.4.1 ou ultérieur. Le routeur se connecte désormais aux pairs I2P en IPv6 comme en IPv4, et les proxys HTTP et SOCKS acceptent les connexions sur les adresses IPv6 de votre serveur.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
