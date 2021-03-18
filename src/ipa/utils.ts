export function nomBD(bd, langues) {
  let nom;
  for (const l of langues) {
    nom = bd.nom[l];
    if (nom) break;
  }
  return nom || Object.values(bd.nom)[0]
}
