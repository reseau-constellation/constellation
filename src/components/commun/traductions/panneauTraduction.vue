<template>
  <v-card outlined>
    <v-card-title>
      {{
        clef
          ? "Proposez un traduction"
          : "Sélectionnez un item de la liste à gauche"
      }}
    </v-card-title>
    <v-card-text>
      <v-card flat>
        <v-textarea
          v-model="traduction"
          :disabled="!clef"
          outlined
          no-resize
          height="100"
          :hint="clef"
          persistent-hint
        >
        </v-textarea>
        <v-card-actions>
          <v-btn
            text
            :disabled="!clef || !texteOriginal"
            @click="() => (traduction = texteOriginal)"
            ><v-icon left>mdi-content-copy</v-icon> Copier originale
          </v-btn>
          <v-spacer />
          <v-btn text :disabled="!clef" @click="$emit('annuler')">
            {{ $t("communs.annuler") }}
          </v-btn>
          <v-btn
            text
            :disabled="!tradPrêteÀSauvegarder"
            outlined
            color="primary"
            @click="sauvegarderTraduction"
          >
            {{ $t("communs.sauvegarder") }}
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-divider />
      <v-card v-if="clef" flat>
        <v-card-title>
          Suggestions de la communauté ({{
            formatterChiffre(suggestions.length)
          }})
        </v-card-title>
        <v-card-text>
          <v-list style="max-height: 200px" class="overflow-y-auto">
            <itemTradCommunauté
              v-for="suggestion in suggestions"
              :key="suggestion.élément.hash"
              :suggestion="suggestion"
              @click="utiliserSuggestion(suggestion)"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { schémaBd } from "@constl/ipa/lib/reseau";

import itemTradCommunauté from "@/components/commun/traductions/itemTradCommunauté.vue";

import {
  suggestionTrad,
  élémentBdTraduction,
  ID_VAR_CLEF,
  ID_VAR_LANGUE_SOURCE,
  ID_VAR_LANGUE_CIBLE,
  ID_VAR_TEXTE_ORIGINAL,
  ID_VAR_TRADUCTION,
  ID_VAR_DATE,
} from "./types";

const ID_MOTCLEF_TRAD =
  "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/7e0cde32-7fee-487c-ad6e-4247f627488e";
const ID_MOTCLEF_TRADS_CONSTELLATION =
  "/orbitdb/zdpuAuk6kRoPQKfwuWi5qMYMSyUMeiTjtcFE23AaHy9MQsXcs/93c94a56-f681-4512-8c4b-5c213119ab4b";

const schémaBdTrads: schémaBd = {
  motsClefs: [ID_MOTCLEF_TRAD, ID_MOTCLEF_TRADS_CONSTELLATION],
  licence: "ODbl-1_0",
  tableaux: [
    {
      idUnique: "trads",
      cols: [
        {
          idVariable: ID_VAR_CLEF,
          idColonne: "clef",
        },
        {
          idVariable: ID_VAR_LANGUE_SOURCE,
          idColonne: "langue source",
        },
        {
          idVariable: ID_VAR_LANGUE_CIBLE,
          idColonne: "langue cible",
        },
        {
          idVariable: ID_VAR_TEXTE_ORIGINAL,
          idColonne: "texte original",
        },
        {
          idVariable: ID_VAR_TRADUCTION,
          idColonne: "traduction",
        },
        {
          idVariable: ID_VAR_DATE,
          idColonne: "date",
        },
      ],
    },
  ],
};

export default mixins(mixinLangues, mixinIPA).extend({
  name: "panneauTraduction",
  props: ["clef", "texteOriginal", "langueSource", "langueCible"],
  mixins: [mixinLangues, mixinIPA],
  components: { itemTradCommunauté },
  data: function () {
    return {
      idTableau: undefined as undefined | string,
      idBdRacine: undefined as undefined | string,

      traduction: "",
      traductionExistante: undefined as undefined | suggestionTrad,
      suggestions: [] as suggestionTrad[],
    };
  },
  watch: {
    clef: function () {
      this.effacerTout();
    },
    langueCible: function () {
      this.effacerTout();
    },
  },
  computed: {
    tradPrêteÀSauvegarder: function (): boolean {
      const traduction = this.traduction.trim();
      const existante = this.traductionExistante
        ? this.traductionExistante.élément.données[ID_VAR_TRADUCTION].trim()
        : "";
      const changée = existante !== traduction;

      return Boolean(this.clef && changée);
    },
    maSuggestion: function (): suggestionTrad | undefined {
      if (!this.clef) return;
      return this.suggestions.filter((s) => {
        const sugg = s.élément.données;
        const { [ID_VAR_CLEF]: clef, [ID_VAR_LANGUE_CIBLE]: langueCible } =
          sugg;
        return (
          s.idBdAuteur === this.idBdRacine &&
          clef === this.clef &&
          langueCible === this.langueCible
        );
      })[0];
    },
  },
  methods: {
    effacerTout: function () {
      this.traduction = "";
      this.traductionExistante = this.maSuggestion;
    },
    utiliserSuggestion: function (suggestion: suggestionTrad) {
      this.traduction = suggestion.élément.données[ID_VAR_TRADUCTION];

      if (suggestion.idBdAuteur === this.idBdRacine)
        this.traductionExistante = suggestion;
      else this.traductionExistante = undefined;
    },
    sauvegarderTraduction: async function () {
      if (!this.idTableau) throw new Error("idTableau non définie.");
      const traduction = this.traduction.trim();

      if (traduction.length) {
        const élément = {
          clef: this.clef,
          langueSource: this.langueSource,
          langueCible: this.langueCible,
          traduction: traduction,
          texteInitial: this.texteOriginal,
        };

        await this.$ipa.tableaux!.ajouterÉlément(this.idTableau, élément);
      }

      if (this.traductionExistante) {
        await this.$ipa.tableaux!.effacerÉlément(
          this.idTableau,
          this.traductionExistante.élément.empreinte
        );
      }
    },
    initialiserSuivi: async function () {
      const oublierIdBdRacine = await this.$ipa.suivreIdBdRacine(
        (id) => (this.idBdRacine = id)
      );

      const oublierTableauBdTrads =
        await this.$ipa.bds!.suivreTableauUniqueDeBdUnique(
          schémaBdTrads,
          ID_MOTCLEF_TRADS_CONSTELLATION,
          "trads",
          (idTableau) => (this.idTableau = idTableau)
        );
      const oublierSuggestionsTrads =
        await this.$ipa.réseau!.suivreÉlémentsDeTableauxUniques<élémentBdTraduction>(
          ID_MOTCLEF_TRADS_CONSTELLATION,
          "trads",
          (suggestions) => (this.suggestions = suggestions)
        );
      this.suivre([
        oublierIdBdRacine,
        oublierTableauBdTrads,
        oublierSuggestionsTrads,
      ]);
    },
  },
});
</script>

<style></style>
