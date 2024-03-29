<template>
  <v-card outlined>
    <v-card-title>
      {{ $t("traduction.பரிந்துரைக்கவும்") }}
    </v-card-title>
    <v-card-text>
      <v-card flat>
        <v-textarea
          v-model="texteOriginal"
          :label="clef ? 'Texte original' : $t('traduction.தேர்ந்தெடுக்கவும்')"
          readonly
          no-resize
          height="50"
          :hint="
            clef
              ? `${$t('dialogueTraductionsInterface.clefSélectionnée')} ${clef}`
              : ''
          "
          persistent-hint
          :append-icon="clef ? 'mdi-content-copy' : ''"
          @click:append="() => (traduction = texteOriginal)"
        />
        <v-textarea
          v-model="traduction"
          :disabled="!clef"
          class="mt-2"
          clearable
          no-resize
          height="100"
          :label="clef ? 'Proposez une traduction' : ''"
          hide-details
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
            :loading="enProgrès"
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
              n: formatterChiffre(suggestionsPourCetItem.length),
            })
          }}
        </v-card-title>
        <v-card-text>
          <v-list style="max-height: 200px" class="overflow-y-auto">
            <itemTradCommunauté
              v-for="suggestion in suggestionsPourCetItem"
              :key="suggestion.empreinte"
              :suggestion="suggestion"
              :autorisee="autorisée"
              @approuver="() => approuverSuggestion(suggestion)"
              @copier="() => utiliserSuggestion(suggestion)"
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
import { TraductionRéseau } from "@/kilimukku/kilimukku";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "panneauTraduction",
  props: ["clef", "texteOriginal", "langueSource", "langueCible"],
  mixins: [mixinLangues, mixinIPA],
  components: { itemTradCommunauté },
  data: function () {
    return {
      enProgrès: false,

      idBdCompte: undefined as undefined | string,
      autorisée: false,
      traduction: "",
      traductionExistante: undefined as undefined | TraductionRéseau,
      suggestions: [] as TraductionRéseau[],
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
      if (this.traduction === null) return false;

      const traduction = this.traduction.trim();
      const existante = this.traductionExistante
        ? this.traductionExistante.traduction.trim()
        : "";
      const changée = existante !== traduction;

      return Boolean(this.clef && changée);
    },
    suggestionsPourCetItem: function (): TraductionRéseau[] {
      return this.suggestions.filter((s) => {
        return s.clef === this.clef && s.langueCible === this.langueCible;
      });
    },
    maSuggestion: function (): TraductionRéseau | undefined {
      if (!this.clef) return;
      return this.suggestionsPourCetItem.filter(
        (s) => s.auteur === this.idBdCompte
      )[0];
    },
  },
  methods: {
    effacerTout: function () {
      this.traduction = "";
      this.traductionExistante = this.maSuggestion;
    },
    utiliserSuggestion: function (suggestion: TraductionRéseau) {
      this.traduction = suggestion.traduction;

      if (suggestion.auteur === this.idBdCompte)
        this.traductionExistante = suggestion;
      else this.traductionExistante = undefined;
    },
    approuverSuggestion: async function (suggestion: TraductionRéseau) {
      return await this.$kilimukku.approuver({ suggestion });
    },
    sauvegarderTraduction: async function () {
      this.enProgrès = true;
      const traduction = this.traduction.trim();

      if (traduction.length) {
        await this.$kilimukku.suggérer({
          clef: this.clef,
          traduction: this.traduction,
          langueCible: this.langueCible,
          langueSource: this.langueSource,
          texteOriginal: this.texteOriginal,
        });
      }

      this.enProgrès = false;
    },
    initialiserSuivi: async function () {
      const oublierIdBdCompte = await this.$ipa.suivreIdBdCompte({
        f: (id) => (this.idBdCompte = id),
      });

      const { fOublier: oublierSuggestionsTrads } =
        await this.$kilimukku.rechercherSuggestions({
          f: (suggestions) => (this.suggestions = suggestions),
        });

      const oublierAutorisée = await this.$kilimukku.suivreEstGestionnaire({
        f: (estGestionnaire) => (this.autorisée = estGestionnaire),
      });
      this.suivre([
        oublierIdBdCompte,
        oublierSuggestionsTrads,
        oublierAutorisée,
      ]);
    },
  },
});
</script>
<style></style>
