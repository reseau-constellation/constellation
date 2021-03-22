export function couper(texte: string, nChar: number) {
  if (texte.length <= nChar) {
    return texte
  } else {
    return texte.slice(0, nChar-3).concat('...')
  }
}
