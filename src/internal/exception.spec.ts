import {ConfigurationError, InvalidSourceDataError} from './exception'

describe('exceptions', () => {
  it('should be Error instances', () => {
    expect(new ConfigurationError()).toBeInstanceOf(Error)
    expect(new InvalidSourceDataError()).toBeInstanceOf(Error)
  })
})
