<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ $t("dialogueNouvelleVariable.மாறி") }}
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleVariable.nom") }}
        </p>
        <boîteNoms
          :noms="noms"
          titre="dialogueNouvelleVariable.தேர்ந்தெடுக்கவும்"
          sousTitre="dialogueNouvelleVariable.சிறந்தது"
          @sauvegarder="sauvegarderNom"
          @changerLangue="changerLangueNom"
          @effacer="effacerNom"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-on="on"
              v-bind="attrs"
              flat
              dense
              outlined
              :readonly="true"
              :value="nom"
              :label="$t('dialogueNouvelleVariable.nom')"
            />
          </template>
        </boîteNoms>

        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleVariable.Description") }}
        </p>
        <boîteNoms
          :noms="descriptions"
          titre="dialogueNouvelleVariable.எதைக்_குறிக்கிறது"
          sousTitre="dialogueNouvelleVariable.சிறந்தது"
          @sauvegarder="sauvegarderDescr"
          @changerLangue="changerLangueDescr"
          @effacer="effacerDescr"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-on="on"
              v-bind="attrs"
              flat
              dense
              outlined
              :readonly="true"
              :value="descr"
              :label="$t('dialogueNouvelleVariable.Description')"
            />
          </template>
        </boîteNoms>

        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleVariable.Catégorie") }}
        </p>
        <v-select v-model="catégorie" :items="catégoriesVariable" outlined dense>
          <template v-slot:item="{ on, item, attrs }">
            <itemListeCatégories
              v-on="on" v-bind="attrs"
              :categorie="item"
            />
          </template>
          <template v-slot:selection="{ item }">
            <v-tooltip v-if="catégorie !== undefined" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip label outlined small v-on="on" v-bind="attrs">
                  <v-icon left small>{{ icôneCatégorieVariable(item) }}</v-icon>
                  {{ $t("variables.catégories." + catégorie) }}
                </v-chip>
              </template>
              <span>
                {{ $t("variables.catégories.info." + catégorie) }}
              </span>
            </v-tooltip>
          </template>
        </v-select>
        <span v-if="false">
          <p class="text-overline mb-0">
            {{ $t("dialogueNouvelleVariable.règles") }}
          </p>
          <v-list>
            <v-list-item @click="ajouterRègle;">
              <v-list-item-avatar>
                <v-icon>mdi-plus</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                {{ $t("dialogueNouvelleVariable.சேர்க்க") }}
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-for="r in [...règlesCatégorie, ...règlesPropre]"
              :key="r"
              dense
            > {{ r}}
            </v-list-item>
          </v-list>
        </span>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="fermer">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!prêt"
          :loading="enProgrès"
          depressed
          outlined
          @click="sauvegarder"
        >
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";

import mixinLangues from "@/mixins/langues";

import { variables } from "@constl/ipa";
import itemListeCatégories from "@/components/variables/itemListeCatégories.vue"

import {
  traduireNom,
  catégoriesVariable,
  icôneCatégorieVariable,
} from "@/utils";

export default mixins(mixinLangues).extend({
  name: "dialogueNouvelleVariable",
  components: { boîteNoms, itemListeCatégories },
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      catégorie: undefined as undefined | variables.catégorieVariables,
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      unités: undefined as undefined | string,

      règlesCatégorie: [],
      règlesPropre: [],

      catégoriesVariable,
      icôneCatégorieVariable,
    };
  },
  computed: {
    prêt: function (): boolean {
      return Boolean(Object.keys(this.noms).length && this.catégorie);
    },
    nom: function (): string | undefined {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : undefined;
    },
    descr: function (): string | undefined {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : undefined;
    },
  },
  methods: {
    sauvegarderNom: function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function ({ langue }: { langue: string }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter((x) => x !== langue)
          .map((x) => [x, this.noms[x]])
      );
    },
    changerLangueNom: function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.effacerNom({ langue: langueOriginale });
      this.sauvegarderNom({ langue, nom });
    },
    sauvegarderDescr: function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      this.descriptions = { ...this.descriptions, [langue]: nom };
    },
    effacerDescr: function ({ langue }: { langue: string }) {
      this.descriptions = Object.fromEntries(
        Object.keys(this.descriptions)
          .filter((x) => x !== langue)
          .map((x) => [x, this.descriptions[x]])
      );
    },
    changerLangueDescr: function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      this.effacerDescr({ langue: langueOriginale });
      this.sauvegarderDescr({ langue, nom });
    },
    sauvegarder: async function () {
      this.enProgrès = true;
      if (!this.catégorie)
        throw new Error(
          this.$t("dialogueNouvelleVariable.குறிப்பிடப்படாதவை") as string
        );
      const idVariable = await this.$ipa.variables!.créerVariable({
        catégorie: this.catégorie,
      });
      await this.$ipa.variables!.ajouterNomsVariable({
        id: idVariable,
        noms: this.noms,
      });
      await this.$ipa.variables!.ajouterDescriptionsVariable({
        id: idVariable,
        descriptions: this.descriptions,
      });
      if (this.unités) {
        await this.$ipa.variables!.sauvegarderUnitésVariable({
          idVariable,
          idUnité: this.unités,
        });
      }
      this.$emit("sauvegarde", { id: idVariable });

      this.fermer();
      this.enProgrès = false;
    },
    fermer: function () {
      this.catégorie = undefined;
      this.descriptions = {};
      this.noms = {};
      this.unités = undefined;

      this.dialogue = false;
    },
    ajouterRègle: function () {
      console.warn("À faire");
    },
  },
});
</script>

<style></style>
