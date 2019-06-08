/**
 * This file defines the entrypoint for the command line interface for
 * report-alchemy.
 *
 * The exported utilities for defining plugins are in api.ts.
 */
import {
  ReportSink,
  ReportSource,
  loadConfiguration,
} from './internal/configuration'
import {ConfigurationError} from './internal/exception'
import {parseArguments} from './internal/parse-arguments'
import {loadPlugins} from './internal/plugin'
import {defaultPlugin} from './internal/default-plugin'
import {
  HandlerLoader,
  HandlerLoaderMap,
  Plugin,
  Problem,
  SinkHandler,
  SourceHandler,
} from './internal/types'
import {openForWriting, readFile} from './internal/io'

/**
 * A map from source/sink types to handlers that have been loaded.
 */
type HandlerMap<Handler> = {[key: string]: Handler}

interface LoadHandlersArgs<Setting extends ReportSink | ReportSource, Handler> {
  configurationList: Setting[]
  plugins: Plugin[]
  getHandlers: (plugin: Plugin) => HandlerLoaderMap<Handler> | undefined
  unknownTypeErrorPrefix: string
}

type HandlersToLoad<Setting extends ReportSink | ReportSource, Handler> =
  readonly (readonly [Setting, HandlerLoader<Handler>])[]

const loadHandlers = <Setting extends ReportSink | ReportSource, Handler>
  (args: LoadHandlersArgs<Setting, Handler>): HandlerLoaderMap<Handler> => {
  const handlerCallbacks: HandlerLoaderMap<Handler> = {}

  // Load callbacks for loading source/sink handlers.
  // Plugins later in the list can replace handlers earlier in the list.
  args.plugins.forEach(plugin => {
    const pluginCallbackMap = args.getHandlers(plugin)

    if (pluginCallbackMap) {
      args.configurationList.forEach(item => {
        const handlerCallback = pluginCallbackMap[item.type]

        if (handlerCallback) {
          handlerCallbacks[item.type] = handlerCallback
        }
      })
    }
  })

  // Throw an exception now if a handler is badly named.
  args.configurationList.forEach(item => {
    if (handlerCallbacks[item.type] === undefined) {
      throw new ConfigurationError(args.unknownTypeErrorPrefix + item.type)
    }
  })

  return handlerCallbacks
}

const resolveHandlers = async<T>(loaderMap: HandlerLoaderMap<T>): Promise<HandlerMap<T>> => {
  const resolved = await Promise.all(
    Object.entries(loaderMap)
      .map(async([type, cb]) => [type, await cb()] as const)
  )
  const resolvedMap: HandlerMap<T> = {}

  resolved.forEach(([type, handler]) => {
    resolvedMap[type] = handler
  })

  return resolvedMap
}

const readProblems = async(
  sources: ReportSource[],
  handlers: HandlerMap<SourceHandler>,
): Promise<Iterable<Readonly<Problem>>> => {
  const sourcesWithHandlersAndBuffers = await Promise.all(
    sources.map(async(source) => [
      source,
      handlers[source.type],
      await readFile(source.filename),
    ] as const)
  )

  function * problemGenerator(): IterableIterator<Problem> {
    for (const [source, handler, buffer] of sourcesWithHandlersAndBuffers) {
      for (const problem of handler(buffer, {})) {
        // Freeze a problem we read, so that none of the functions for writing
        // the problems can modify them.
        Object.freeze(problem.start)
        Object.freeze(problem.end)
        Object.freeze(problem)

        yield problem
      }
    }
  }

  return problemGenerator()
}

const writeProblems = async(
  sinks: ReportSink[],
  handlers: HandlerMap<SinkHandler>,
  problems: Iterable<Readonly<Problem>>,
): Promise<void> => {
  const sinksWithHandlersAndBuffers = (
    await Promise.all(
      sinks.map(async(sink) => [
        sink,
        handlers[sink.type],
        await openForWriting(sink.filename),
      ] as const)
    )
  )

  const sinkWriters = sinksWithHandlersAndBuffers
    .map(([sink, handler, buffer]) => handler(buffer, {}))

  for (const problem of problems) {
    sinkWriters.forEach(write => write(problem))
  }

  sinkWriters.forEach(write => write(null))
}

const runReportAlchemy = async(): Promise<void> => {
  const args = parseArguments()
  const config = await loadConfiguration(args.config)
  const plugins = [defaultPlugin, ...await loadPlugins(config.plugins)]

  // Set up maps for loading handlers first.
  // No handlers are loaded until all of the types are checked.
  const sourceHandlerLoaderMap = loadHandlers({
    configurationList: config.sources,
    plugins,
    getHandlers: plugin => plugin.sourceHandlers,
    unknownTypeErrorPrefix: 'Unknown source type: ',
  })
  const sinkHandlerLoaderMap = loadHandlers({
    configurationList: config.sinks,
    plugins,
    getHandlers: plugin => plugin.sinkHandlers,
    unknownTypeErrorPrefix: 'Unknown sink type: ',
  })

  // Load all of the handlers now the types are checked.
  const sourceHandlers = await resolveHandlers(sourceHandlerLoaderMap)
  const sinkHandlers = await resolveHandlers(sinkHandlerLoaderMap)

  // Read and write the files now the handlersa are loaded.
  const problems = await readProblems(config.sources, sourceHandlers)
  await writeProblems(config.sinks, sinkHandlers, problems)
}

const isErrNoException = (value: any): value is NodeJS.ErrnoException =>
  value != null && typeof value.errno === 'number'

runReportAlchemy()
  .then()
  .catch(error => {
    if (error instanceof ConfigurationError) {
      console.error(error.message)
    } else if (
      isErrNoException(error)
      && error.path
      && error.code === 'ENOENT'
    ) {
      console.error(error.message)
    } else {
      console.error(error)
    }

    process.exit(1)
  })
