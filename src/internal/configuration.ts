import * as process from 'process'
import * as path from 'path'

import {fileReadable, pathsUpwards, readFile} from './io'
import {isArrayOf, isString} from './typeguard'
import {ConfigurationError} from './exception'

/**
 * A report to read.
 */
export interface ReportSource {
  type: string
  filename: string
}

/**
 * A report to write.
 */
export interface ReportSink {
  type: string
  filename: string
}

export interface ConfigurationOptions {
  baseDir: string
  sources: ReportSource[]
  sinks: ReportSink[]
  plugins: string[]
}

const configurationFilenameList = Object.freeze([
  '.alchemyrc.json',
])

const discoverConfigurationFilename = async(): Promise<string | null> => {
  for (const dir of pathsUpwards(process.cwd())) {
    for (const configFilename of configurationFilenameList) {
      const filename = path.join(dir, configFilename)

      if (await fileReadable(filename)) {
        return filename
      }
    }
  }

  return null
}

export const isReportSource = (value: any): value is ReportSource =>
  typeof value === 'object'
  && value !== null
  && typeof value.type === 'string'
  && typeof value.filename === 'string'

export const isReportSink = (value: any): value is ReportSink =>
  typeof value === 'object'
  && value !== null
  && typeof value.type === 'string'
  && typeof value.filename === 'string'

export const loadConfiguration = async(filename?: string): Promise<ConfigurationOptions> => {
  const resolvedFilename = filename || await discoverConfigurationFilename()

  if (resolvedFilename == null) {
    throw new ConfigurationError('No configuration file found!')
  }

  let fileData

  try {
    fileData = await readFile(resolvedFilename)
  } catch (error) {
    throw new ConfigurationError('Could not read configuration file')
  }

  const jsonData = JSON.parse(fileData.toString()) as unknown
  let userConfig

  if (typeof jsonData === 'object' && jsonData !== null) {
    userConfig = jsonData as {[key: string]: unknown}
  } else {
    throw new ConfigurationError('Configuration JSON is not an object')
  }

  const config: ConfigurationOptions = {
    baseDir: path.dirname(resolvedFilename),
    sources: [],
    sinks: [],
    plugins: [],
  }

  if (isArrayOf(userConfig.sources, isReportSource)) {
    config.sources = userConfig.sources
  } else {
    throw new ConfigurationError('Invalid report `sources` configuration')
  }

  if (isArrayOf(userConfig.sinks, isReportSink)) {
    config.sinks = userConfig.sinks
  } else {
    throw new ConfigurationError('Invalid report `sinks` configuration')
  }

  if (isArrayOf(userConfig.plugins, isString)) {
    config.plugins = userConfig.plugins
  }

  return config
}
