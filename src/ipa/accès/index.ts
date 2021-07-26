import { AccessControllers } from "orbit-db";
import ContrôleurConstellation from "./contrôleurConstellation";
import ContrôleurAccès from "./contrôleurAccès";

AccessControllers.addAccessController({
  AccessController: ContrôleurConstellation,
});
AccessControllers.addAccessController({
  AccessController: ContrôleurAccès,
});

export default AccessControllers;
