import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.60.0:6',
  releaseNotes: {
    en_US: `Add I2P Tunnel now accepts Bitcoin's peer interfaces. Bitcoin does not yet adopt an address issued from here, so creating one has no effect until a future Bitcoin release uses it. Package documentation corrected.`,
    es_ES: `Añadir túnel I2P ahora acepta las interfaces de pares de Bitcoin. Bitcoin todavía no adopta una dirección emitida desde aquí, así que crear una no tiene efecto hasta que una versión futura de Bitcoin la utilice. Documentación del paquete corregida.`,
    de_DE: `I2P-Tunnel hinzufügen akzeptiert jetzt die Peer-Schnittstellen von Bitcoin. Bitcoin übernimmt eine hier ausgestellte Adresse noch nicht, sodass das Anlegen einer Adresse ohne Wirkung bleibt, bis eine künftige Bitcoin-Version sie verwendet. Paketdokumentation korrigiert.`,
    pl_PL: `Dodaj tunel I2P akceptuje teraz interfejsy węzłów Bitcoina. Bitcoin nie przyjmuje jeszcze adresu wystawionego tutaj, więc utworzenie go nie przynosi skutku, dopóki nie użyje go przyszła wersja Bitcoina. Poprawiono dokumentację pakietu.`,
    fr_FR: `Ajouter un tunnel I2P accepte désormais les interfaces de pairs de Bitcoin. Bitcoin n'adopte pas encore une adresse émise ici, donc en créer une reste sans effet jusqu'à ce qu'une future version de Bitcoin l'utilise. Documentation du paquet corrigée.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
