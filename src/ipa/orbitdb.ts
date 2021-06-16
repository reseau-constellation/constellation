import OrbitDB from "orbit-db";
import AccessControllers from "./accès";
import IPFS from "ipfs";

export default async function initOrbite(sfip: typeof IPFS) {
  return await OrbitDB.createInstance(sfip, {
    AccessControllers,
  });
}
