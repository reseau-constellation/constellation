import Vue from "vue";
import { ouvrirLien } from "@/utils";
import { licences, infoLicences } from "@constl/ipa/licences";

export default Vue.extend({
  data: function () {
    return {
      licence: null as null | string,
      licences,
      infoLicences,
      droits: [] as string[],
      conditions: [] as string[],
      limitations: [] as string[],
    };
  },
  computed: {
    licenceApprouvée: function (): boolean {
      if (!this.licence) return false;
      return licences.includes(this.licence);
    },
    lienLicenceValid: function (): boolean {
      return Boolean(
        this.licence &&
          (this.$t(`licences.info.${this.licence}.lien`) as string).slice(
            0,
            4
          ) === "http"
      );
    },
    nomLicence: function (): string | undefined {
      if (this.licence) {
        return !this.licenceApprouvée
          ? this.licence
          : (this.obtNomLicence(this.licence) as string);
      }
      return undefined;
    },
  },
  watch: {
    licence: function (val) {
      if (!infoLicences[val]) return;
      this.droits = infoLicences[val].droits || [];
      this.conditions = infoLicences[val].conditions || [];
      this.limitations = infoLicences[val].limitations || [];
    },
  },
  methods: {
    ouvrirLienLicence: function () {
      if (this.licence) {
        ouvrirLien(this.$t(`licences.info.${this.licence}.lien`) as string);
      }
    },
    obtNomLicence(licence: string): string {
      return this.$t(`licences.info.${licence || "introuvable"}.nom`) as string;
    },
  },
  mounted: function () {
    this.droits = this.licence ? infoLicences[this.licence].droits : [];
    this.conditions = this.licence ? infoLicences[this.licence].conditions : [];
    this.limitations = this.licence
      ? infoLicences[this.licence].limitations
      : [];
  },
});
