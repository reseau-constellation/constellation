import Vue from "vue";
import { schémaFonctionOublier } from "@/ipa/client";

export default Vue.extend({
  data: function () {
    return {
      crochets: [] as schémaFonctionOublier[],
      crochetIPA: ()=>{
        //Fonction vide pour l'instant
      },
    };
  },
  methods: {
    async initialiserSuivi(): Promise<void> {
      // À implémenter dans le composant
    },
    suivre(crochet: schémaFonctionOublier | schémaFonctionOublier[] ): void {
      if (!Array.isArray(crochet)) {
        crochet = [crochet];
      }
      this.crochets = [...crochet, ...this.crochets];
    },
    oublierCrochets(): void {
      this.crochets.forEach((c) => c());
      this.crochets = []
    },
    async réInitialiserSuivi(): Promise<void> {
      this.oublierCrochets();
      await this.initialiserSuivi();
    }
  },
  mounted: function () {
    this.crochetIPA = this.initialiserSuivi.bind(this);
    this.$ipa.setMaxListeners(0);
    this.$ipa.on("pret", this.crochetIPA);
    if (this.$ipa.pret) {
      this.initialiserSuivi();
    }
  },
  destroyed: function () {
    this.$ipa.off("pret", this.crochetIPA);
    this.oublierCrochets();
  },
});
