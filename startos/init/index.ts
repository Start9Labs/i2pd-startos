import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { registerUrlPlugin, exportUrls } from '../plugin/url'
import { seedI2pdConfig } from './seedI2pdConfig'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedI2pdConfig,
  setInterfaces,
  actions,
  dependencies,
  registerUrlPlugin,
  exportUrls,
)

export const uninit = sdk.setupUninit(versionGraph)
