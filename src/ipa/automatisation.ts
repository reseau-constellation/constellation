export type formatTélécharger = "ods" | "xls" | "xlsx";
export interface SpécificationAutomatisation {}
export interface SpécificationTélécharger extends SpécificationAutomatisation {
  id: string;
  format: formatTélécharger;
}
export interface SpécificationTéléverser extends SpécificationAutomatisation {
  idTableau: string;
}
interface Automatisation {}
export default class Automatisations {
  automatisations: Automatisation[];
  constructor() {
    this.automatisations = [];
  }

  async ajouterAutomatisationTéléCharger() {}

  async ajouterAutomatisationTéléVerser() {}

  async annulerAutomatisation() {}

  async suivreAutomatisations() {}
}
