import SFIP from "ipfs";

export default function initSFIP(dir = "./ipfs") {
  const spif = await SPIF.create({
    relay: { enabled: true, hop: { enabled: true, active: true } },
    EXPERIMENTAL: { pubsub: true },
    repo: dir
  });
  return spif;
}
