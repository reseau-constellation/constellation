import { create, IPFS } from "ipfs";
import wrtc from "wrtc";
// import WebRTCStar from "libp2p-webrtc-star";
// import { WebSockets } from "@libp2p/websockets";
// import { WebRTCDirect } from "@libp2p/webrtc-direct";
// import { MulticastDNS } from '@libp2p/mdns'
// import { KadDHT } from '@libp2p/kad-dht';
import { Noise } from "@chainsafe/libp2p-noise";

// https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#setup-webrtc-transport-and-discovery
// https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-config/src/libp2p.browser.js
// https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core-config/src/libp2p.js
export default async function initSFIP(dir = "./sfip-cnstl"): Promise<IPFS> {
  const sfip = await create({
    libp2p: {
      // @ts-ignore
      modules: {
        transport: [
          //           new WebRTCStar(),
          //           new WebSockets(),
          //           new WebRTCDirect()
        ],
        connectionEncryption: [new Noise()],
        //         peerDiscovery: [MulticastDNS],
        //         dht: KadDHT,
      },
      config: {
        peerDiscovery: {
          webRTCStar: {
            // <- note the lower-case w - see https://github.com/libp2p/js-libp2p/issues/576
            enabled: true,
          },
        },
        transport: {
          WebRTCStar: {
            // <- note the upper-case w- see https://github.com/libp2p/js-libp2p/issues/576
            wrtc,
            connEncryption: [Noise],
          },
        },
      },
      transportManager: { faultTolerance: 1 },
    },
    relay: { enabled: true, hop: { enabled: true, active: true } },
    config: {
      Addresses: {
        Swarm: [
          // https://suda.pl/free-webrtc-star-heroku/
          "/dns4/arcane-springs-02799.herokuapp.com/tcp/443/wss/p2p-webrtc-star/",
        ],
      },
    },
    repo: dir,
  });

  return sfip;
}
