import {HandlerLoader, Plugin, Problem, SinkLoader, SourceLoader} from '../types'

const createLoader = <Module extends object, Key extends keyof Module>
  (cb: () => Promise<Module>, key: Key): HandlerLoader<Module[Key]> =>
    async() => (await cb())[key]

const junitSource: SourceLoader = createLoader(
  () => import('./junit'),
  'readJunit',
)

const junitSink: SinkLoader = createLoader(
  () => import('./junit'),
  'writeJunit',
)

export const defaultPlugin: Plugin = {
  sourceHandlers: {
    junit: junitSource,
  },
  sinkHandlers: {
    junit: junitSink,
  },
}
