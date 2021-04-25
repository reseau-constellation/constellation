const SFIP = import("ipfs");

export default async function initSFIP(dir = "./ipfs") {
    const libSFIP = await SFIP
    const sfip = await libSFIP.create({
      relay: { enabled: true, hop: { enabled: true, active: true } },
      config: {
        Addresses: {
          "Swarm": ['/dns4/arcane-springs-02799.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'],
          // "Bootstrap": []
        }
      },
      repo: dir
    });
    window.sfip = sfip
    return sfip;
  //}
}
