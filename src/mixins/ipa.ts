import Vue from "vue";
import { schémaFonctionOublier } from "@/ipa/client";

export default Vue.extend({
  data: function () {
    return {
      crochets: [] as schémaFonctionOublier[],
      crochetIPA: () => {
        //Fonction vide pour l'instant
      },
      ipaPrèt: false,
    };
  },
  methods: {
    async initialiserSuivi(): Promise<void> {
      // À implémenter dans le composant
      this.ipaPrèt = true;
    },
    suivre(crochet: schémaFonctionOublier | schémaFonctionOublier[]): void {
      if (!Array.isArray(crochet)) {
        crochet = [crochet];
      }
      this.crochets = [...crochet, ...this.crochets];
    },
    oublierCrochets(): void {
      this.crochets.forEach((c) => c());
      this.crochets = [];
    },
    async réInitialiserSuivi(): Promise<void> {
      this.oublierCrochets();
      await this.initialiserSuivi();
    },
  },
  mounted: function () {
    this.crochetIPA = this.initialiserSuivi.bind(this);

    this.$ipa.on("prêt", this.crochetIPA);
    if (this.$ipa.prêt) {
      this.initialiserSuivi();
    }
  },
  destroyed: function () {
    this.$ipa.off("prêt", this.crochetIPA);
    this.oublierCrochets();
  },
});
