import { v4 as uuidv4 } from "uuid";
import { tempsAléatoire } from "./utils";

export async function obtTableau(id: string) {
  await new Promise(resolve => setTimeout(resolve, tempsAléatoire()));
  return {
    nom: {
      fr: "Tableau test ".concat(id),
      en: "Test table ".concat(id)
    },
    bdOrbite: uuidv4()
  };
}
export async function obtVarsTableau(id: string): Promise<string[]> {
  const bd = await obtTableau(id);
  return ["xxxdate", "xxxpréc", "xxxtmax", "xxxtmin"];
  /*[
    { text: "Date", value: "date" },
    { text: "Précipitation", value: "préc" },
    { text: "Température max", value: "tmax" },
    { text: "Température min", value: "tmin" }
  ]*/
}

export async function obtDonnéesTableau(id: string) {
  const bd = await obtTableau(id);
  return [
    { date: "2000-01-01", préc: "2", tmax: "24", tmin: "18" },
    { date: "2000-01-02", préc: "0", tmax: "22", tmin: "13" },
    { date: "2000-01-03", préc: "2", tmax: "24", tmin: "18" },
    { date: "2000-01-04", préc: "0", tmax: "22", tmin: "13" },
    { date: "2000-01-05", préc: "2", tmax: "24", tmin: "18" },
    { date: "2000-01-06", préc: "0", tmax: "22", tmin: "13" }
  ];
}
