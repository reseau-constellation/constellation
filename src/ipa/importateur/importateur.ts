/*
import importerDonnéesJSON, { DonnéesJSON } from "./json";

async function importerDonnéesCovid(
  url = "https://covid.ourworldindata.org/data/owid-covid-data.json"
) {
  return await importerDonnéesURL(url);
}

async function importerDonnéesURL(url: string, format = "json") {
  switch (format) {
    case "json": {
      const données = await fetch(url);
      const donnéesJSON = (await données.json()) as DonnéesJSON;
      return importerDonnéesJSON(donnéesJSON);
    }
    default:
      throw Error(
        `Le format ${format} n'est pas pris en charge pour l'instant.`
      );
  }
}

export abstract class Importateur {
  abstract tableaux: () => Promise<string[]>;
}
*/
