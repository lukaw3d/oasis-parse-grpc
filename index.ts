import {parseCborFromBase64, parseGrpc} from './parseGrpc'
import * as oasis from '@oasisprotocol/client'

window.oasis = oasis
window.parseCborFromBase64 = parseCborFromBase64
window.parseGrpc = parseGrpc
console.log({ oasis, parseCborFromBase64, parseGrpc })

function loadInputFromHash() {
  const rawLines = decodeURIComponent(location.hash.replace(/^#/, ''))
  if (rawLines) window.base64lines.value = rawLines
}

function parse() {
  try {
    const rawLines = window.base64lines.value.trim()

    const lines = rawLines.split('\n').map(line => line.trim())
    const parsedCbor = lines.flatMap(line => line ? parseCborFromBase64(line) : '')
    console.log({parsedCbor})

    const parsedGrpc = parsedCbor.map(obj => parseGrpc(obj))
    console.log({parsedGrpc})

    window.parsed.textContent = parsedGrpc.map(obj => obj ? JSON.stringify(obj, null, 2) : '\n').join('\n')
  } catch (e) {
    window.parsed.textContent = e
  }
}
window.base64lines.addEventListener('input', () => {
  location.hash = encodeURIComponent(window.base64lines.value)
  parse()
})

loadInputFromHash()
parse()
