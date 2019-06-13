import * as fs from 'fs'

import {fileReadable, openForWriting, pathsUpwards, readFile} from './io'

describe('readFile', () => {
  let promise: Promise<Buffer>
  let readFileCallback: Parameters<typeof fs.readFile>[1]

  beforeEach(() => {
    expect.assertions(2)

    const spy = spyOn(fs, 'readFile')

    promise = readFile('foo')

    expect(spy).toHaveBeenCalledWith('foo', expect.any(Function))

    readFileCallback = spy.calls.mostRecent().args[1]
  })

  it('should reject on error', () => {
    readFileCallback(new Error('some error'), null as any)

    expect(promise).rejects.toEqual('some error').catch(() => undefined)
  })

  it('should resolve with a buffer', () => {
    readFileCallback(null, {dummy: 1} as any)

    expect(promise).resolves.toEqual({dummy: 1})
  })
})

describe('fileReadable', () => {
  let promise: Promise<boolean>
  let errorCallback: (err: Error | null) => undefined

  beforeEach(() => {
    expect.assertions(2)

    const spy = spyOn(fs, 'access')

    promise = fileReadable('some-filename')

    expect(spy).toHaveBeenCalledWith(
      'some-filename',
      fs.constants.F_OK | fs.constants.R_OK,
      expect.any(Function),
    )

    errorCallback = spy.calls.mostRecent().args[2]
  })

  it('should indicate files are readable if there are no errors', () => {
    errorCallback(null)

    expect(promise).resolves.toBe(true)
  })

  it('should indicate files are not readable if there are errors', () => {
    errorCallback(new Error())

    expect(promise).resolves.toBe(false)
  })
})

describe('openForWriting', () => {
  let openSpy: jasmine.Spy
  let writeSteamSpy: jasmine.Spy
  let promise: Promise<fs.WriteStream>
  let openCallback: Parameters<typeof fs.open>[2]

  beforeEach(() => {
    expect.assertions(3)

    openSpy = spyOn(fs, 'open')
    writeSteamSpy = spyOn(fs, 'createWriteStream')
      .and.returnValue({dummy: 1})

    promise = openForWriting('foo')

    expect(openSpy).toHaveBeenCalledWith('foo', 'w', expect.any(Function))

    openCallback = openSpy.calls.mostRecent().args[2]
  })

  it('should reject the promise on error', () => {
    openCallback(new Error('some error'), 0)

    expect(writeSteamSpy).not.toHaveBeenCalled()
    expect(promise).rejects.toEqual('some error').catch(() => undefined)
  })

  it('should resolve with a write stream', () => {
    openCallback(null, 42)

    expect(writeSteamSpy).toHaveBeenCalledWith('', {fd: 42})
    expect(promise).resolves.toEqual({dummy: 1})
  })
})

describe('pathsUpwards', () => {
  it('should walk up directories correctly', () => {
    expect(Array.from(pathsUpwards('/foo/bar/baz'))).toEqual([
      '/foo/bar/baz',
      '/foo/bar',
      '/foo',
      '/',
    ])
  })

  it('should handle redundant slashes', () => {
    expect(Array.from(pathsUpwards('//foo//bar//baz/'))).toEqual([
      '/foo/bar/baz',
      '/foo/bar',
      '/foo',
      '/',
    ])
  })
})
