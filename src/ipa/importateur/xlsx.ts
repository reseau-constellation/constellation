import BD from './bs'

import xlsx from 'xlsx'
// '/Users/julienmalard/Documents/Projet Wietske Medema/BD test/Copy of Wilmot_2016-2018_FWIS.xlsm'
// XLSX.readFile('test.xlsx')

LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const séq = n => Array.from(Array(n).keys()).map(x=>x+1)

const lettreÀNombre = function(lettre) {
  let n = 0
  for (l of lettre) {
    n *= LETTRES.length
    n += l
  }
}

const nombreÀLettre = function(nombre) {

}

class BDXlsx extens BD {

  constructor(fichier, motDePasse) {
    var données = new Uint8Array(fichier)
    this.doc = XLSX.read(données, {
      type: 'array',
      cellDates: true,
      password: modDePasse
    })
  }

  static ext = ['ods', 'xlsx', 'xls']

  valeurs(tableau, cols) {
    
  }

  obtTableau(nom) {
    return this.doc.Sheets[nom]
  }

  get tableaux() {
    return this.doc.SheetNames
  }

  get entêtes(nom: string) {
    var tableau = this.obtTableau(nom)
    var plage = tableau['!ref'].split(':').map(x=>x.match(/[a-zA-Z]+|[0-9]+/g))
    var premièreFile = plage[0][1]
    var dernièreCol = lettreÀNombre(plage[1][0])

    return séq(dernièreCol).map(
      x => {
        var cel = nombreÀLettre(x).concat(premièreFile)
        var valCel = tableau[cel]
      }
    ).filter(x=>x).map(x=>x.v)
  }

}
