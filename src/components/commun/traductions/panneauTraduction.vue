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
            <item-trad-communauté
              v-for="suggestion in suggestions"
              :key="suggestion.hash"
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

import { élémentBdListe, élémentsBd } from "@/ipa/client";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { schémaBd, élémentDeMembre } from "@/ipa/réseau";

const ID_MOTCLEF_TRAD =
  "/orbitdb/zdpuAsiATt21PFpiHj8qLX7X7kN3bgozZmhEVswGncZYVHidX/7e0cde32-7fee-487c-ad6e-4247f627488e";
const ID_MOTCLEF_TRADS_CONSTELLATION =
  "/orbitdb/zdpuAuk6kRoPQKfwuWi5qMYMSyUMeiTjtcFE23AaHy9MQsXcs/93c94a56-f681-4512-8c4b-5c213119ab4b";

const motsClefsBdsTrads = [ID_MOTCLEF_TRAD, ID_MOTCLEF_TRADS_CONSTELLATION];

const ID_VAR_CLEF =
  "/orbitdb/zdpuAximNmZyUWXGCaLmwSEGDeWmuqfgaoogA7KNSa1B2DAAF/dd77aec3-e7b8-4695-b068-49ce4227b360";
const ID_VAR_LANGUE_SOURCE =
  "/orbitdb/zdpuAshZMdYeDD7PfJzjGrfwfCSFSJdTAVh72sFByYUuUoFbh/a6b7359e-3661-46af-965b-06023ed39d15";
const ID_VAR_LANGUE_CIBLE =
  "/orbitdb/zdpuAsV9tm4QSa5nrcmzFGHjfuv1hGmfC9PTPTHFnWRTajNcs/3d0616b1-99f5-4041-95c1-94b30cd0472b";
const ID_VAR_TEXTE_ORIGINAL =
  "/orbitdb/zdpuAshZMdYeDD7PfJzjGrfwfCSFSJdTAVh72sFByYUuUoFbh/a6b7359e-3661-46af-965b-06023ed39d15";
const ID_VAR_TRADUCTION =
  "/orbitdb/zdpuB2aXkMVoPxyG9xpfDdCUhJpD8jWHe49BjY3JmddVAHXQ7/ac313db8-f5c0-4d57-ba5b-e4d6fe119b6d";
const ID_VAR_DATE =
  "/orbitdb/zdpuAkfSVLrNUdbXjWifzuUM5vvWhLBThGTqshuJJUY8yphtF/3e801a45-ddb1-416b-b1aa-9af613e300da";

const idsVars = [
  ID_VAR_CLEF,
  ID_VAR_LANGUE_SOURCE,
  ID_VAR_LANGUE_CIBLE,
  ID_VAR_TEXTE_ORIGINAL,
  ID_VAR_TRADUCTION,
  ID_VAR_DATE,
];

const schémaBdTrads: schémaBd = {
  motsClefs: {
    tous: motsClefsBdsTrads,
  },
  tableaux: [
    {
      vars: idsVars,
    },
  ],
};

type suggestionTrad = élémentDeMembre<élémentBdTraduction>;

interface élémentBdTraduction {
  clef: string;
  langueSource: string;
  langueCible: string;
  texteOriginal?: string;
  traduction: string;
  date: number;
}

export default mixins(mixinLangues, mixinIPA).extend({
  name: "panneauTraduction",
  props: ["clef", "texteOriginal", "langueSource", "langueCible"],
  mixins: [mixinLangues, mixinIPA],
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
        ? this.traductionExistante.élément.payload.value.traduction.trim()
        : "";
      const changée = existante !== traduction;

      return Boolean(this.clef && changée);
    },
    maSuggestion: function (): suggestionTrad | undefined {
      if (!this.clef) return;
      return this.suggestions.filter((s) => {
        const sugg = s.élément.payload.value;
        const { clef, langueCible } = sugg;
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
      this.traduction = suggestion.élément.payload.value.traduction;

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
          this.traductionExistante.élément.hash
        );
      }
    },
    initialiserSuivi: async function () {
      const oublierIdBdRacine = await this.$ipa.suivreIdBdRacine(
        (id) => (this.idBdRacine = id)
      );
      const oublierTableauBdTrads =
        await this.$ipa.bds!.suivreTableauBdDeSchéma(
          schémaBdTrads,
          (idTableau) => (this.idTableau = idTableau)
        );
      const oublierSuggestionsTrads =
        await this.$ipa.réseau!.suivreÉlémentsBdsSelonSchéma(
          schémaBdTrads,
          0,
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
