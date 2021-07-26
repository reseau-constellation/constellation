export type formatTélécharger = "ods" | "xls" | "xlsx";
export interface SpécificationAutomation {}
export interface SpécificationTélécharger extends SpécificationAutomation {
  id: string;
  format: formatTélécharger;
}
export interface SpécificationTéléverser extends SpécificationAutomation {
  idTableau: string;
}
interface Automation {}
export default class Automations {
  automations: Automation[];
  constructor() {
    this.automations = [];
  }

  async ajouterAutomationTéléCharger() {}

  async ajouterAutomationTéléVerser() {}

  async annulerAutomation() {}

  async suivreAutomations() {}
}
