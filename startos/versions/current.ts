import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.0:2',
  releaseNotes: {
    en_US:
      'The HTTP proxy’s address helper is opt-in: links opened through the proxy cannot add or change address-book entries unless you turn on Address Helper in Configure Router. The I2P Router Console requires signing in; run the Set Console Password action to get your credentials.',
    es_ES:
      'El asistente de direcciones del proxy HTTP es opcional: los enlaces abiertos a través del proxy no pueden añadir ni cambiar entradas de la libreta de direcciones a menos que active Asistente de direcciones en Configurar Router. La consola del router I2P requiere iniciar sesión; ejecute la acción Establecer contraseña de la consola para obtener sus credenciales.',
    de_DE:
      'Der Adresshelfer des HTTP-Proxys ist optional: Über den Proxy geöffnete Links können keine Adressbucheinträge hinzufügen oder ändern, solange Sie Adresshelfer unter „Router konfigurieren“ nicht einschalten. Die I2P-Routerkonsole erfordert eine Anmeldung; führen Sie die Aktion Konsolenpasswort festlegen aus, um Ihre Zugangsdaten zu erhalten.',
    pl_PL:
      'Pomocnik adresów proxy HTTP jest opcjonalny: linki otwierane przez proxy nie mogą dodawać ani zmieniać wpisów książki adresowej, dopóki nie włączysz opcji Pomocnik adresów w Konfiguruj Router. Konsola routera I2P wymaga zalogowania; uruchom akcję Ustaw hasło konsoli, aby otrzymać dane logowania.',
    fr_FR:
      'L’assistant d’adresses du proxy HTTP est facultatif : les liens ouverts via le proxy ne peuvent ajouter ni modifier d’entrées du carnet d’adresses tant que vous n’activez pas Assistant d’adresses dans Configurer le routeur. La console du routeur I2P exige une connexion ; exécutez l’action Définir le mot de passe de la console pour obtenir vos identifiants.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
