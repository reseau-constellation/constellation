import isElectron from "is-electron";
import DOMPurify from "dompurify";
import { marked } from "marked";
import streamSaver from "streamsaver";
import { WritableStream } from "web-streams-polyfill/ponyfill";

import { rutzibChabäl as écritureLangue } from "nuchabal";

streamSaver.WritableStream = WritableStream;

export async function copier(texte: string): Promise<void> {
  if (!navigator.clipboard) return;
  await navigator.clipboard.writeText(texte);
}

export function traduireNom(
  dicNom: { [key: string]: string },
  langues: string[]
): string {
  let nom;
  for (const l of langues) {
    nom = dicNom[l];
    if (nom) return nom;
  }
  // Si la langue n'est pas disponible, cherchons quelque chose avec au moins le même alphabet
  for (const langue of langues) {
    const écriture = écritureLangue(langue);
    const langueAlternative = Object.keys(dicNom).find(
      (x) => écritureLangue(x) === écriture
    );
    if (langueAlternative) return dicNom[langueAlternative];
  }

  // Sinon, tan pis !
  return Object.values(dicNom)[0];
}

export async function ouvrirLien(lien: string): Promise<void> {
  if (isElectron()) {
    const electron = await import("electron");
    const { shell } = electron;
    shell.openExternal(lien);
  } else {
    window.open(lien, "_newtab");
  }
}

export function compilerMarkdown(texte: string): string {
  return DOMPurify.sanitize(marked(texte));
}

export function téléchargerURL(uri: string, nom: string): void {
  const lien = document.createElement("a");
  lien.download = nom;
  // @ts-ignore
  lien.href = uri;
  lien.click();
}

export function itérableÀFlux(
  itérable: AsyncIterable<Uint8Array>
): ReadableStream<Uint8Array> {
  const itérateur = itérable[Symbol.asyncIterator]();

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await itérateur.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

export function téléchargerFlux(
  fluxLecture: ReadableStream,
  nom: string
): void {
  console.log({ fluxLecture });
  const fileStream = streamSaver.createWriteStream(nom);
  if (window.WritableStream && fluxLecture.pipeTo) {
    fluxLecture.pipeTo(fileStream);
  }

  const writer = fileStream.getWriter();
  writer.write();
  writer.close();
  const reader = fluxLecture.getReader();
  const pump = () =>
    reader
      .read()
      .then((res) =>
        res.done ? writer.close() : writer.write(res.value).then(pump)
      );

  pump();
}

export interface interfaceCouleurScore {
  couleur: string;
  note: string;
}

export function couleurScore(score: number): interfaceCouleurScore {
  if (score === null) return { couleur: "#666666", note: "?" };
  score *= 100;
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

export function icôneCatégorieVariable(catégorie: string): string {
  switch (catégorie) {
    case "numérique":
      return "mdi-numeric";
    case "chaîne":
      return "mdi-text-short";
    case "catégorique":
      return "mdi-view-list";
    case "booléen":
      return "mdi-order-bool-ascending-variant";
    case "géojson":
      return "mdi-map-marker";
    case "fichier":
      return "mdi-file";
    case "vidéo":
      return "mdi-play-box-outline";
    case "audio":
      return "mdi-waveform";
    case "photo":
      return "mdi-image";
    case "date":
      return "mdi-calendar-month-outline";
    case "heure":
      return "mdi-clock-time-four-outline";
    case "dateEtHeure":
      return "mdi-calendar-clock";
    default:
      return "";
  }
}

export const catégoriesVariable = [
  "numérique",
  "date",
  "heure",
  "dateEtHeure",
  "chaîne",
  "catégorique",
  "booléen",
  "géojson",
  "vidéo",
  "audio",
  "photo",
  "fichier",
];
