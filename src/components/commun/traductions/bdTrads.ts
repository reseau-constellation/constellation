import ClientConstellation, {
  schémaFonctionOublier,
  schémaFonctionSuivi,
  élémentBdListe,
} from "@/ipa/client";
/*

const _gérerMesBdsTrads = async function (bds: string[], f: schémaFonctionSuivi<string>) {
  console.log({ bds });
  if (bds.length === 0) {
    // Attendre 5 secondes pour être sûrs que la BD n'est pas tout simplement en traîn d'être chargée
    this.chrono = setTimeout(async () => {
      if (!this.idBdTrads) {
        const idBdTrads = await this.$ipa.bds!.créerBd("ODbl-1_0");
        await this.$ipa.bds!.ajouterMotsClefsBd(
          idBdTrads,
          motsClefsBdsTrads
        );
        this.idBdTrads = idBdTrads;
        console.log({ idBdTrads });
      }
    }, 5000);
  } else {
    if (this.chrono) clearTimeout(this.chrono);
    if (bds.length === 1) {
      this.idBdTrads = bds[0];
    } else {
      const pourGarder = bds.sort()[0];
      console.warn(
        "À faire : combiner BDs pour éviter la perte des données"
      );
      bds
        .filter((bd) => bd !== pourGarder)
        .forEach(async (bd) => {
          await this.$ipa.bds!.effacerBd(bd);
        });
      this.idBdTrads = pourGarder;
    }
  }
}

idBdTrads: async function () {
  if (!this.idBdTrads) return;
  const oublierTableauxBdTrads = await this.$ipa.bds!.suivreTableauxBd(
    this.idBdTrads,
    (tableaux) => {
      if (tableaux.length === 0) {
        this.chronoTableaux = setTimeout(async () => {
          this.idTableau = await this.$ipa.bds!.ajouterTableauBD(this.idBdTrads)
          await Promise.all(
            idsVars.map(async (idVar) => {
              await this.$ipa.tableaux!.ajouterColonneTableau(
                this.idTableau, idVar
              )
            })
          )
        }, 5000);
      } else if (tableaux.length === 1) {
        this.idTableau = tableaux[0];
      } else {
        throw new Error("À implémenter aussi");
      }
    }
  );
  this.suivre([oublierTableauxBdTrads]);
}
*/
