import {parseArguments} from './parse-arguments'

// The output we expect for --help
const expectedHelp = `usage: report-alchemy [-h] [-v] [-c CONFIG]

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -c CONFIG, --config CONFIG
                        A path to a configuration file.
`

describe('parseArguments', () => {
  let argv: string[]
  let writeSpy: jasmine.Spy
  let exitSpy: jasmine.Spy

  beforeEach(() => {
    argv = process.argv
    process.argv = ['/usr/bin/node', 'report-alchemy']

    writeSpy = spyOn(process.stdout, 'write')
    exitSpy = spyOn(process, 'exit')
  })

  afterEach(() => {
    process.argv = argv
  })

  it('should handle no arguments correctly', () => {
    expect(parseArguments()).toEqual({})
    expect(writeSpy).not.toHaveBeenCalled()
    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('should print the correct help text', () => {
    process.argv.push('--help')

    parseArguments()

    expect(writeSpy).toHaveBeenCalledWith(expectedHelp)
    expect(exitSpy).toHaveBeenCalled()
  })

  it('should parse -c', () => {
    process.argv.push('-c', 'foo.cfg')

    expect(parseArguments()).toEqual({config: 'foo.cfg'})
  })

  it('should parse --config', () => {
    process.argv.push('--config', 'foo.cfg')

    expect(parseArguments()).toEqual({config: 'foo.cfg'})
  })
})
