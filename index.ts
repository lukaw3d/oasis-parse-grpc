import {parseGrpcFromBase64} from './parseGrpc'


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
window.base64lines.addEventListener('input', parse);
parse();
