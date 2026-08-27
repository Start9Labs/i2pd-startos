import { i2pdConfig } from '../fileModels/i2pd'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export const resetRouter = sdk.Action.withoutInput(
  'reset-router',

  async () => ({
    name: i18n('Reset Router'),
    description: i18n(
      "Clear the router's cached view of the I2P network and restart, so it finds peers from scratch.",
    ),
    warning: i18n(
      'The router is offline for several minutes while it reseeds. Your .b32.i2p addresses and the router identity are not affected.',
    ),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    // The wipe itself has to happen with no i2pd process on the volume, so it
    // is queued for the next start rather than done here.
    await i2pdConfig.merge(effects, { resetPending: true })
    await sdk.restart(effects)

    return {
      version: '1' as const,
      title: i18n('Reset Queued'),
      message: i18n(
        'The router is restarting and will rebuild its network database. It takes several minutes to integrate again.',
      ),
      result: null,
    }
  },
)
