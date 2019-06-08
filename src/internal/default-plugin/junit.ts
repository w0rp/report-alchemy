import {XmlDocument} from 'xmldoc'

import {InvalidSourceDataError} from '../exception'
import {Problem, SinkHandler, SourceHandler} from '../types'
import {xmlText} from '../xml'

interface ESLintTextData {
  line: number
  column: number
  severity: 'error' | 'warning'
  message: string
  code: string
}

const eslintRegex = /^line (\d+), col (\d+), (Error|Warning) - (.+) \((.+)\)$/

const parseESLintText = (text: string): ESLintTextData | null => {
  const match = text.match(eslintRegex)

  return match ? {
    line: parseInt(match[1], 10),
    column: parseInt(match[2], 10),
    severity: match[3] === 'Error' ? 'error' : 'warning',
    message: match[4],
    code: match[5],
  } : null
}

export const readJunit: SourceHandler = (buffer, options) => {
  const doc = new XmlDocument(buffer.toString())

  if (doc.name !== 'testsuites') {
    throw new InvalidSourceDataError()
  }

  return (function * (): IterableIterator<Problem> {
    for (const suite of doc.childrenNamed('testsuite')) {
      const filename = suite.attr['name']

      for (const testcase of suite.childrenNamed('testcase')) {
        const failure = testcase.childNamed('failure')

        if (!failure) {
          continue
        }

        const text = failure.val
        const {
          line = 1,
          column = 1,
          severity = 'error',
          message = text,
          code = undefined,
        } =
          parseESLintText(text)
          || {}

        yield {
          filename,
          severity,
          start: {line, column},
          end: {line, column},
          message,
          code,
        }
      }
    }
  }())
}

export const writeJunit: SinkHandler = (stream, options) => {
  stream.write('<?xml version="1.0" encoding="utf-8"?>\n')
  stream.write('<testsuites>\n')

  const problemsForFiles: {[key: string]: Problem[]} = {}

  return (problem) => {
    if (problem) {
      // Collect problems, as we have to know how many problems there are per
      // file to generate valid JUnit output.
      if (problemsForFiles[problem.filename] == null) {
        problemsForFiles[problem.filename] = []
      }

      problemsForFiles[problem.filename].push(problem)
    } else {
      const entries = Object.keys(problemsForFiles)
        .sort()
        .map(key => [key, problemsForFiles[key]] as const)
        .filter(([key, value]) => value.length > 0)

      entries.forEach(([filename, problems]) => {
        stream.write('<testsuite package="org.report" time="0"')
        stream.write(xmlText` tests="${problems.length}"`)
        stream.write(xmlText` errors="${problems.length}"`)
        stream.write(xmlText` name="${filename}">\n`)

        problems.forEach(problem => {
          const name = problem.code
            ? 'org.report.' + problem.code
            : 'org.report.error'
          const {line, column} = problem.start
          const severity = problem.severity === 'error' ? 'Error' : 'Warning'

          stream.write(xmlText`<testcase time="0" name="${name}">`)
          stream.write(xmlText`<failure message="${problem.message}">`)
          stream.write(xmlText`line ${line}, col ${column}, ${severity}`)
          stream.write(xmlText` - ${problem.message}`)

          if (problem.code) {
            stream.write(xmlText` (${problem.code})`)
          }

          stream.write('</failure></testcase>\n')
        })

        stream.write('</testsuite>\n')
      })

      stream.write('</testsuites>\n')
    }
  }
}
