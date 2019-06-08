/**
 * Types to export from the project and for internal use.
 *
 * Only types which should be documented as part of the API should be exported
 * here.
 */
import * as fs from 'fs'

/**
 * A position for a location of a problem.
 */
export interface Position {
  /** A line number, starting at 1 */
  readonly line: number
  /** A column number, starting at 1 */
  readonly column: number
}

/** A problem that can be reported. */
export interface Problem {
  /**
   * The filename for the problem.
   *
   * The path should be absolute or relative to the work directory.
   */
  readonly filename: string
  /**
   * The severity of the problem.
   */
  readonly severity: 'error' | 'warning' | 'info'
  /**
   * An optional error code.
   */
  readonly code?: string
  /**
   * Where the problem starts in the file.
   */
  readonly start: Position
  /**
   * Where the problem ends in the file.
   */
  readonly end: Position
  /**
   * A message to display for the problem.
   */
  readonly message: string
}

/**
 * The type of data used for source or sink options.
 */
export type HandlerOptions = {[key: string]: string | number}

/**
 * A function for reading problems from a report.
 */
export type SourceHandler = (
  buffer: Buffer,
  options: HandlerOptions,
) => Iterable<Problem>

/**
 * A function for writing problems to a report.
 *
 * The function returned will be sent problems one-by-one, until a terminating
 * null value is sent, indicating the end of the stream of problems.
 */
export type SinkHandler = (
  writeStream: fs.WriteStream,
  options: HandlerOptions,
) => (nextProblem: Problem | null) => void

/**
 * A function that can be called to load a source or sink handler.
 */
export type HandlerLoader<Handler> = () => Promise<Handler>

/**
 * A function that can be called to load a source handler.
 */
export type SourceLoader = HandlerLoader<SourceHandler>

/**
 * A function that can be called to load a sink handler.
 */
export type SinkLoader = HandlerLoader<SinkHandler>

/**
 * A map from source/sink types to loader functions.
 */
export type HandlerLoaderMap<Handler> = {[key: string]: HandlerLoader<Handler>}

/**
 * The report-alchemy plugin.
 */
export interface Plugin {
  /**
   * Handlers for reading report types.
   *
   * Sources will be loaded on demand.
   */
  sourceHandlers?: HandlerLoaderMap<SourceHandler>
  /**
   * Handlers for writing report types.
   *
   * Sinks will be loaded on demand.
   */
  sinkHandlers?: HandlerLoaderMap<SinkHandler>
}
