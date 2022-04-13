import Vue from "vue";
import { utils } from "@constl/ipa";

export default Vue.extend({
  data: function () {
    return {
      crochets: [] as utils.schémaFonctionOublier[],
      crochetIPA: () => {
        //Fonction vide pour l'instant
      },
    };
  },
  methods: {
    async initialiserSuivi(): Promise<void> {
      // À implémenter dans le composant
    },
    suivre(
      crochet: utils.schémaFonctionOublier | utils.schémaFonctionOublier[]
    ): void {
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
    this.initialiserSuivi();
  },
  destroyed: function () {
    this.oublierCrochets();
  },
});
