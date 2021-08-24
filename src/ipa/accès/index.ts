import { AccessControllers } from "orbit-db";
import ContrôleurConstellation from "./contrôleurConstellation";
import ContrôleurAccès from "./contrôleurAccès";

export const enregistrerContrôleurs = () => {
  AccessControllers.addAccessController({
    AccessController: ContrôleurConstellation,
  });
  AccessControllers.addAccessController({
    AccessController: ContrôleurAccès,
  });
};

enregistrerContrôleurs();

export default AccessControllers;
