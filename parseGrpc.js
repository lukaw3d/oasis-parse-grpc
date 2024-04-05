const oasis = require('@oasisprotocol/client');
const {utils, BigNumber} = require('ethers');

function parseGrpc(obj) {
  if (obj == null) return '' + obj
  return JSON.parse(JSON.stringify(
    obj,
    (k, v) => {
      if (v instanceof Uint8Array) {
        try { return { as_CBOR: oasis.misc.fromCBOR(v) } } catch (err) {}
        if (['rate', 'rate_min', 'rate_max'].includes(k)) return utils.formatUnits(v, 3) + '%';
        if (v.length === 21) return annotateKnown(oasis.staking.addressToBech32(v))
        if (v.length === 32) return annotateKnown(oasis.staking.addressToBech32(oasis.address.fromData('oasis-core/address: staking', 0, v))) + ' or ' + annotateKnown(oasis.misc.toHex(v))
        if (v.length > 32) return annotateKnown(oasis.misc.toHex(v))
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
  try {
    return [oasis.misc.fromCBOR(oasis.misc.fromBase64(base64data))]
  } catch (e) {}

  // Split multiple base64s; hopefully gAAAA is a good delimiter. `/(?=...)/g` keeps the delimiter after splitting.
  var [cborPart, ...otherParts] = base64data.split(/(?=gAAAA)/g)

  return [
    oasis.misc.fromCBOR(oasis.misc.fromBase64(cborPart).slice(5)),
    ...otherParts.map(atob),
  ]
}

function annotateKnown(str) {
  const knownStrings = {
    'oasis1qrmufhkkyyf79s5za2r8yga9gnk4t446dcy3a5zm': 'Consensus Common Pool',
    'oasis1qqnv3peudzvekhulf8v3ht29z4cthkhy7gkxmph5': 'Consensus Fee Accumulator',
    'oasis1qp65laz8zsa9a305wxeslpnkh9x4dv2h2qhjz0ec': 'Governance Escrow',
    'oasis1qzq8u7xs328puu2jy524w3fygzs63rv3u5967970': 'Burn Address',
    'oasis1qrd3mnzhhgst26hsp96uf45yhq6zlax0cuzdgcfc': 'Sapphire	Mainnet',
    'oasis1qqczuf3x6glkgjuf0xgtcpjjw95r3crf7y2323xd': 'Sapphire Testnet',
    'oasis1qzvlg0grjxwgjj58tx2xvmv26era6t2csqn22pte': 'Emerald	Mainnet',
    'oasis1qr629x0tg9gm5fyhedgs9lw5eh3d8ycdnsxf0run': 'Emerald Testnet',
    'oasis1qrnu9yhwzap7rqh6tdcdcpz0zf86hwhycchkhvt8': 'Cipher Mainnet',
    'oasis1qqdn25n5a2jtet2s5amc7gmchsqqgs4j0qcg5k0t': 'Cipher Testnet',

    'oasis1qz78phkdan64g040cvqvqpwkplfqf6tj6uwcsh30': 'ParaTime Common Pool',
    'oasis1qp3r8hgsnphajmfzfuaa8fhjag7e0yt35cjxq0u4': 'ParaTime Fee Accumulator',
    'oasis1qp7x0q9qahahhjas0xde8w0v04ctp4pqzu5mhjav': 'Rewards Account',
    'oasis1qr677rv0dcnh7ys4yanlynysvnjtk9gnsyhvm6ln': 'Pending Withdrawal Account',
    'oasis1qzcdegtf7aunxr5n5pw7n5xs3u7cmzlz9gwmq49r': 'Pending Delegation Account',
    'oasis1qq2v39p9fqk997vk6742axrzqyu9v2ncyuqt8uek': 'Zero Address',

    '000000000000000000000000000000000000000000000000e2eaa99fc008f87f': 'Emerald Mainnet',
    '00000000000000000000000000000000000000000000000072c8215e60d5bca7': 'Emerald Testnet',
    '000000000000000000000000000000000000000000000000e199119c992377cb': 'Cipher Mainnet',
    '0000000000000000000000000000000000000000000000000000000000000000': 'maybe Cipher Testnet',
    '000000000000000000000000000000000000000000000000f80306c9858e7279': 'Sapphire Mainnet',
    '000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c': 'Sapphire Testnet',
    '0000000000000000000000000000000000000000000000004febe52eb412b421': 'PontusX Testnet ',
  }
  if (str === 'oasis1xtnxq8') return '?'

  return str + (knownStrings[str] ? ' ' + knownStrings[str] : '')
}

module.exports = {parseGrpc, parseCborFromBase64}
