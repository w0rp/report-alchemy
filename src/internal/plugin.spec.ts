import {loadPlugins} from './plugin'

describe('loadPlugins', () => {
  it('should load an empty list of plugins correctly', async() => {
    const result = await loadPlugins([])

    expect(result).toEqual([])
  })
})
