const oasis = require('@oasisprotocol/client');
const {utils, BigNumber} = require('ethers');

function parseGrpc(obj) {
  return JSON.parse(JSON.stringify(
    obj,
    (k, v) => {
      if (v instanceof Uint8Array) {
        try { return { as_CBOR: oasis.misc.fromCBOR(v) } } catch (err) {}
        if (['rate', 'rate_min', 'rate_max'].includes(k)) return utils.formatUnits(v, 3) + '%';
        if (v.length === 21) return oasis.staking.addressToBech32(v)
        if (v.length === 32) return oasis.staking.addressToBech32(oasis.address.fromData('oasis-core/address: staking', 0, v)) + ' or ' + oasis.misc.toHex(v)
        if (v.length > 32) return oasis.misc.toHex(v)
        if (v.length === 0) return '[]'
        return utils.commify(utils.formatUnits(v, 9))
      }
      if (typeof v === 'bigint') return v.toString()
      if (v instanceof Map) return { as_Map: [...v.entries()] }
      return v
    },
    2
  ))
}

function parseCborFromBase64(base64data) {
  // Split multiple base64s; hopefully gAAAA is a good delimiter. `/(?=...)/g` keeps the delimiter after splitting.
  var [cborPart, ...otherParts] = base64data.split(/(?=gAAAA)/g)

  return [
    oasis.misc.fromCBOR(oasis.misc.fromBase64(cborPart).slice(5)),
    ...otherParts.map(atob),
  ]
}

module.exports = {parseGrpc, parseCborFromBase64}
