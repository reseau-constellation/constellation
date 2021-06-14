const SFIP = import("ipfs");
import isElectron from "is-electron"
import wrtc from 'wrtc'
import WebRTCStar from 'libp2p-webrtc-star'

export default async function initSFIP(dir = "./ipfs") {
  const libSFIP = await SFIP;

  // @ts-ignore
  const sfip = await libSFIP.create({
    libp2p: {
      modules: {
        transport: [WebRTCStar]
      },
      config: {
        peerDiscovery: {
          webRTCStar: { // <- note the lower-case w - see https://github.com/libp2p/js-libp2p/issues/576
            enabled: true
          }
        },
        transport: {
          WebRTCStar: { // <- note the upper-case w- see https://github.com/libp2p/js-libp2p/issues/576
            wrtc
          }
        }
      }
      // transportManager: { faultTolerance: 1 }
    },
    relay: { enabled: true, hop: { enabled: true, active: true } },
    // @ts-ignore
    config: {
      Addresses: {
        Swarm: [
          "/dns4/arcane-springs-02799.herokuapp.com/tcp/443/wss/p2p-webrtc-star/",
        ],
      },
    },
    repo: dir,
  });

  return sfip;
}
