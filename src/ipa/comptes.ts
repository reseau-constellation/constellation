import "initOrbite" from "./orbitdb"
import "initSFIP" from "./ipfs"

export default class Données {
  constructor(dir = "./sfip-cnstl") {
    this._dir = dir
  }

  async initialiser() {
    this.sfip = await initSFIP(this._dir)
    this.orbite = await initOrbite(this.sfip)
  }

  async ouvrirBD(id: string) {
    await this.orbite.open(id)
  }

  async écouterBD(id: string, action) {
    const bd = await this.ouvrirBD(id)

  }

  static async créer() {
    const données = new Données()
    await données.initialiser()
    return données
  }
}
