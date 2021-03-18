import SFIP from 'ipfs'

export default function initSFIP(dir: string = './ipfs') {
  const spif = await SPIF.create({
    relay: { enabled: true, hop: { enabled: true, active: true } },
    EXPERIMENTAL: { pubsub: true },
    repo: dir
  })
  return spif
}
