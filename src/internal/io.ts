import * as fs from 'fs'
import * as path from 'path'

/**
 * Return a promise which reads a Buffer from a file.
 *
 * If the file cannot be read, the promise will be rejected with an error.
 */
export const readFile = (filename: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

/**
 * Create a promise that returns `true` if a file is readable.
 */
export const fileReadable = (filename: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK | fs.constants.R_OK, err => {
      resolve(!err)
    })
  })

/**
 * Open a file for writing.
 *
 * The promise will resolve when data can be written to the file.
 */
export const openForWriting = (filename: string): Promise<fs.WriteStream> =>
  new Promise((resolve, reject) => {
    fs.open(filename, 'w', (err, fd) => {
      if (err) {
        reject(err)
      } else {
        resolve(fs.createWriteStream('', {fd}))
      }
    })
  })

/**
 * Yield all paths from a start directory up to the root of the filesystem.
 */
export function * pathsUpwards(startDirectory: string): Iterable<string> {
  const root = path.parse(startDirectory).root
  let dir = startDirectory

  while (true) {
    yield dir

    if (dir === root) {
      break
    }

    dir = path.dirname(dir)
  }
}
