<template>
  <v-card outlined>
    <v-card-title>
      {{
        clef
          ? $t("traduction.பரிந்துரைக்கவும்")
          : $t("traduction.தேர்ந்தெடுக்கவும்")
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
            ><v-icon left>mdi-content-copy</v-icon>
            {{ $t("traduction.நகலெடுக்கவும்") }}
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
          {{
            $t("traduction.பரிந்துரைகள்", {
              n: formatterChiffre(suggestions.length),
            })
          }}
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
import { bds } from "@constl/ipa";

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
  ID_COL_CLEF,
  ID_COL_LANGUE_SOURCE,
  ID_COL_LANGUE_CIBLE,
  ID_COL_TEXTE_ORIGINAL,
  ID_COL_TRADUCTION,
  ID_COL_DATE,
} from "./types";

const ID_MOTCLEF_TRAD =
  "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/7e0cde32-7fee-487c-ad6e-4247f627488e";
const ID_MOTCLEF_TRADS_CONSTELLATION =
  "/orbitdb/zdpuAuk6kRoPQKfwuWi5qMYMSyUMeiTjtcFE23AaHy9MQsXcs/93c94a56-f681-4512-8c4b-5c213119ab4b";

const schémaBdTrads: bds.schémaSpécificationBd = {
  motsClefs: [ID_MOTCLEF_TRAD, ID_MOTCLEF_TRADS_CONSTELLATION],
  licence: "ODbl-1_0",
  tableaux: [
    {
      idUnique: "trads",
      cols: [
        {
          idVariable: ID_VAR_CLEF,
          idColonne: ID_COL_CLEF,
        },
        {
          idVariable: ID_VAR_LANGUE_SOURCE,
          idColonne: ID_COL_LANGUE_SOURCE,
        },
        {
          idVariable: ID_VAR_LANGUE_CIBLE,
          idColonne: ID_COL_LANGUE_CIBLE,
        },
        {
          idVariable: ID_VAR_TEXTE_ORIGINAL,
          idColonne: ID_COL_TEXTE_ORIGINAL,
        },
        {
          idVariable: ID_VAR_TRADUCTION,
          idColonne: ID_COL_TRADUCTION,
        },
        {
          idVariable: ID_VAR_DATE,
          idColonne: ID_COL_DATE,
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
      idBdCompte: undefined as undefined | string,

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
        ? this.traductionExistante.élément.données[ID_COL_TRADUCTION].trim()
        : "";
      const changée = existante !== traduction;

      return Boolean(this.clef && changée);
    },
    maSuggestion: function (): suggestionTrad | undefined {
      if (!this.clef) return;
      return this.suggestions.filter((s) => {
        const sugg = s.élément.données;
        const { [ID_COL_CLEF]: clef, [ID_COL_LANGUE_CIBLE]: langueCible } =
          sugg;
        return (
          s.idBdCompte === this.idBdCompte &&
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
      this.traduction = suggestion.élément.données[ID_COL_TRADUCTION];

      if (suggestion.idBdCompte === this.idBdCompte)
        this.traductionExistante = suggestion;
      else this.traductionExistante = undefined;
    },
    sauvegarderTraduction: async function () {
      if (!this.idTableau) throw new Error("idTableau non définie.");
      const traduction = this.traduction.trim();

      if (traduction.length) {
        const élément = {
          [ID_COL_CLEF]: this.clef,
          [ID_COL_LANGUE_SOURCE]: this.langueSource,
          [ID_COL_LANGUE_CIBLE]: this.langueCible,
          [ID_COL_TRADUCTION]: traduction,
          [ID_COL_TEXTE_ORIGINAL]: this.texteOriginal,
          [ID_COL_DATE]: new Date().getTime(),
        };

        await this.$ipa.tableaux!.ajouterÉlément({
          idTableau: this.idTableau,
          vals: élément,
        });
      }

      if (this.traductionExistante) {
        await this.$ipa.tableaux!.effacerÉlément({
          idTableau: this.idTableau,
          empreinteÉlément: this.traductionExistante.élément.empreinte,
        });
      }
    },
    initialiserSuivi: async function () {
      const oublierIdBdCompte = await this.$ipa.suivreIdBdCompte({
        f: (id) => (this.idBdCompte = id),
      });

      const oublierTableauBdTrads =
        await this.$ipa.bds!.suivreTableauUniqueDeBdUnique({
          schémaBd: schémaBdTrads,
          motClefUnique: ID_MOTCLEF_TRADS_CONSTELLATION,
          idUniqueTableau: "trads",
          f: (idTableau) => (this.idTableau = idTableau),
        });
      const { fOublier: oublierSuggestionsTrads } =
        await this.$ipa.réseau!.suivreÉlémentsDeTableauxUniques<élémentBdTraduction>(
          {
            motClefUnique: ID_MOTCLEF_TRADS_CONSTELLATION,
            idUniqueTableau: "trads",
            f: (suggestions) => (this.suggestions = suggestions),
          }
        );
      this.suivre([
        oublierIdBdCompte,
        oublierTableauBdTrads,
        oublierSuggestionsTrads,
      ]);
    },
  },
});
</script>
<style></style>
