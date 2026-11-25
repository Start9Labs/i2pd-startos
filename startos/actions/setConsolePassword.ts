import { utils } from '@start9labs/start-sdk'
import { i2pdConfig } from '../fileModels/i2pd'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { consoleUsername } from '../utils'

export const setConsolePassword = sdk.Action.withoutInput(
  'set-console-password',
  async ({ effects }) => {
    const alreadySet = !!(await i2pdConfig
      .read((c) => c.consolePassword)
      .const(effects))
    return {
      name: alreadySet
        ? i18n('Reset Console Password')
        : i18n('Set Console Password'),
      description: i18n(
        'Generate a new random password for signing in to the I2P Router Console.',
      ),
      warning: alreadySet
        ? i18n(
            'Replaces the current console password. The old password stops working.',
          )
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },
  async ({ effects }) => {
    const consolePassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await i2pdConfig.merge(effects, { consolePassword })

    return {
      version: '1',
      title: i18n('Console Credentials'),
      message: i18n(
        'Use these credentials to sign in to the I2P Router Console.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: consoleUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: consolePassword,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
