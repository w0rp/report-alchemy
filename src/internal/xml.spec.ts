import {escapeXML, xmlText} from './xml'

describe('escapeXML', () => {
  it('should escape xml appropriately', () => {
    expect(escapeXML('bar&<>\'"foo'))
      .toEqual('bar&amp;&lt;&gt;&apos;&quot;foo')
  })
})

describe('xmlText', () => {
  it('should format xml text approriately', () => {
    expect(xmlText`a${'&'}b${'<'}c`).toEqual('a&amp;b&lt;c')
    expect(xmlText`a${'&'}b${'<'}`).toEqual('a&amp;b&lt;')
    expect(xmlText`${'&'}b${'<'}`).toEqual('&amp;b&lt;')
    expect(xmlText`${'&'}b${'<'}c`).toEqual('&amp;b&lt;c')
    expect(xmlText`${'&'}b${'<'}c${'>'}`).toEqual('&amp;b&lt;c&gt;')
    expect(xmlText`${'&'}${'<'}${'>'}`).toEqual('&amp;&lt;&gt;')
  })

  it('should format numbers appropriately', () => {
    expect(xmlText`a${1}b${2}c`).toEqual('a1b2c')
  })
})
