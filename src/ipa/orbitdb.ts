import OrbitDB from "orbit-db";
import AccessControllers from "./controlleursAccès";

export default async function initOrbite(sfip) {
  return await this.OrbitDB.createInstance(sfip, {
    AccessControllers
  });
}
