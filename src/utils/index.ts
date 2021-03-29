import isElectron from "is-electron";
import DOMPurify from "dompurify";
import marked from "marked";
import { rutzib_chabäl as écritureLangue } from "nuchabal";

export function couper(texte: string, nChar: number) {
  if (texte.length <= nChar) {
    return texte;
  } else {
    return texte.slice(0, nChar - 3).concat("...");
  }
}
export function traduireNom(
  dicNom: { [key: string]: string },
  langues: string[]
) {
  let nom;
  for (const l of langues) {
    nom = dicNom[l];
    if (nom) return nom;
  }
  // Si la langue n'est pas disponible, cherchons quelque chose avec au moins le même alphabet
  const écrituresVoulues = langues.map(l => {
    return { écriture: écritureLangue(l), langue: l };
  });
  for (const { langue, écriture } of écrituresVoulues) {
    const langueAlternative = Object.keys(dicNom).find(
      x => écritureLangue(x) === écriture
    );
    if (langueAlternative) return dicNom[langueAlternative];
  }

  // Sinon, tan pis !
  return Object.values(dicNom)[0];
}

export async function ouvrirLien(lien: string) {
  if (isElectron()) {
    const electron = await import("electron");
    const { shell } = electron;
    shell.openExternal(lien);
  } else {
    window.open(lien, "_newtab");
  }
}

export function compilerMarkdown(texte: string) {
  return DOMPurify.sanitize(marked(texte));
}

export function couleurScore(score: number) {
  if (score >= 95) {
    return { couleur: "#1e7145", note: "A" };
  } else if (score >= 90) {
    return { couleur: "#00a300", note: "A-" };
  } else if (score >= 85) {
    return { couleur: "#99b433", note: "B" };
  } else if (score >= 80) {
    return { couleur: "#ffc40d", note: "B-" };
  } else if (score >= 70) {
    return { couleur: "#e3a21a", note: "C+" };
  } else if (score >= 60) {
    return { couleur: "#da532c", note: "C" };
  } else if (score >= 55) {
    return { couleur: "#ee1111", note: "D" };
  } else {
    return { couleur: "#b91d47", note: "F" };
  }
}
