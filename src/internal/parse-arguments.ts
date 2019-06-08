import {ArgumentParser} from 'argparse'

export interface Arguments {
  config?: string
}

export const parseArguments = (): Arguments => {
  const args: Arguments = {}

  const parser = new ArgumentParser({
    version: '0.1.0',
    addHelp: true,
  })
  parser.addArgument(['-c', '--config'], {
    help: 'A path to a configuration file',
  })

  const rawArgs = parser.parseArgs() as {[key: string]: unknown}

  if (typeof rawArgs.config === 'string') {
    args.config = rawArgs.config
  }

  return args
}
