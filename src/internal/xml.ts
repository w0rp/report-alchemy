
const characterMap: Readonly<{[key: string]: string}> = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\'': '&apos;',
  '"': '&quot;',
})

/**
 * Escape all special XML characters in a string.
 */
export const escapeXML = (str: string): string =>
  str.replace(/[&<>'"]/g, x => characterMap[x])

/**
 * A template literal function for automatically escaping expressions in XML.
 */
export const xmlText = (
  strings: TemplateStringsArray,
  ...values: (string | number)[]
): string => {
  const parts: string[] = new Array(strings.length + values.length)
  const length = strings.length - 1

  for (let i = 0; i < length; ++i) {
    parts[i * 2] = strings[i]

    const currentValue = values[i]

    if (typeof currentValue === 'number') {
      parts[i * 2 + 1] = String(currentValue)
    } else {
      parts[i * 2 + 1] = escapeXML(currentValue)
    }
  }

  parts[length * 2] = strings[length]

  return parts.join('')
}
