import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_3_0_0_0 } from './v3.0.0_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_3_0_0_0],
})
