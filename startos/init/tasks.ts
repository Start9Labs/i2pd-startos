import { setConsolePassword } from '../actions/setConsolePassword'
import { i2pdConfig } from '../fileModels/i2pd'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const tasks = sdk.setupOnInit(async (effects) => {
  if (!(await i2pdConfig.read((c) => c.consolePassword).const(effects))) {
    await sdk.action.createOwnTask(effects, setConsolePassword, 'important', {
      reason: i18n('Set a password to sign in to the I2P Router Console'),
    })
  }
})
