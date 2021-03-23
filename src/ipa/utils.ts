export function nomBD(bd: { nom: string }, langues: string[]) {
  let nom;
  for (const l in langues) {
    nom = bd.nom[l];
    if (nom) break;
  }
  return nom || Object.values(bd.nom)[0];
}
