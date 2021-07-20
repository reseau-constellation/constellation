import Vue from "vue";
import { ouvrirLien } from "@/utils";
import { licences, infoLicences } from "@/ipa/licences";

export default Vue.extend({
  data: function () {
    return {
      licences,
      infoLicences,
      droits: this.licence ? infoLicences[this.licence].droits : [],
      conditions: this.licence ? infoLicences[this.licence].conditions : [],
      limitations: this.licence ? infoLicences[this.licence].limitations : [],
    };
  },
  computed: {
    licenceApprouvée: function () {
      return licences.includes(this.licence);
    },
    lienLicenceValid: function () {
      return (
        this.licence &&
        this.$t(`licences.info.${this.licence}.lien`).slice(0, 4) === "http"
      );
    },
    nomLicence: function () {
      return this.licence && !this.licenceApprouvée
        ? this.licence
        : this.obtNomLicence(this.licence);
    },
  },
  watch: {
    licence: function (val) {
      this.droits = infoLicences[val].droits || [];
      this.conditions = infoLicences[val].conditions || [];
      this.limitations = infoLicences[val].limitations || [];
    },
  },
  methods: {
    ouvrirLienLicence: function () {
      if (this.licence) {
        ouvrirLien(this.$t(`licences.info.${this.licence}.lien`));
      }
    },
    obtNomLicence(licence) {
      return this.$t(`licences.info.${licence || "introuvable"}.nom`);
    },
  },
});
