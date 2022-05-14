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
        <v-menu
          offset-x
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              flat
              dense
              outlined
              v-on="on"
              v-bind="attrs"
              :readonly="true"
              :value="nom"
              :label="$t('dialogueNouvelleVariable.nom')"
            />
          </template>
          <boîteNoms
            :noms="noms"
            :titre="$t('dialogueNouvelleVariable.தேர்ந்தெடுக்கவும்')"
            :sousTitre="$t('dialogueNouvelleVariable.சிறந்தது')"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          />
        </v-menu>

        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleVariable.Description") }}
        </p>
        <v-menu
          offset-x
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              flat
              dense
              outlined
              v-on="on"
              v-bind="attrs"
              :readonly="true"
              :value="descr"
              :label="$t('dialogueNouvelleVariable.Description')"
            />
          </template>
          <boîteNoms
            :noms="descriptions"
            :titre="$t('dialogueNouvelleVariable.எதைக்_குறிக்கிறது')"
            :sousTitre="$t('dialogueNouvelleVariable.சிறந்தது')"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          />
        </v-menu>

        <p class="text-overline mb-2">
          {{ $t("dialogueNouvelleVariable.Catégorie") }}
        </p>
        <v-select v-model="catégorie" :items="optionsCatégories" outlined dense>
          <template v-slot:item="{ on, item }">
            <v-list-item v-on="on">
              <v-list-item-avatar>
                <v-icon>{{ item.icône }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                {{ $t(`variables.catégories.${item.text}`) }}
                <v-list-item-subtitle>
                  {{ $t("variables.catégories.info." + item.text) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:selection="{ item }">
            <v-chip label outlined dense>
              <v-icon left>{{ item.icône }}</v-icon>
              {{ $t(`variables.catégories.${item.text}`) }}
            </v-chip>
          </template>
        </v-select>

        <p class="text-overline mb-0">
          {{ $t("dialogueNouvelleVariable.கட்டுப்பாடு") }}
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
          >
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="fermer">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn color="primary" :disabled="!prêt" depressed @click="sauvegarder">
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

import {
  traduireNom,
  catégoriesVariable,
  icôneCatégorieVariable,
} from "@/utils";

export default mixins(mixinLangues).extend({
  name: "dialogueNouvelleVariable",
  components: { boîteNoms },
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,

      catégorie: undefined as undefined | variables.catégorieVariables,
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      unités: undefined as undefined | string,

      règlesCatégorie: [],
      règlesPropre: [],
    };
  },
  computed: {
    prêt: function (): boolean {
      return Boolean(Object.keys(this.noms).length && this.catégorie);
    },
    optionsCatégories: (): { text: string; icône: string }[] => {
      return catégoriesVariable.map((x) => {
        return { text: x, icône: icôneCatégorieVariable(x) };
      });
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
