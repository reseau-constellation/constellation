import isElectron from "is-electron";
const SFIP = import("ipfs");

export default async function initSFIP(dir = "./ipfs") {
  const libSFIP = await SFIP;
  // @ts-ignore
  const sfip = await libSFIP.create({
    relay: { enabled: true, hop: { enabled: true, active: true } },
    // @ts-ignore
    config: {
      Addresses: {
        // Touche pas à ça
        Swarm: isElectron()
          ? []
          : [
              "/dns4/arcane-springs-02799.herokuapp.com/tcp/443/wss/p2p-webrtc-star/"
            ]
        // "Bootstrap": []
      }
    },
    repo: dir
  });
  return sfip;
  //}
}
