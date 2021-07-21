<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline"> Nouvelle variable </v-card-title>
      <v-divider />

      <v-card-text class="mt-3">
        <p class="text-overline mb-2">Nom</p>
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
              label="Nom"
            />
          </template>
          <boîteNoms
            :noms="noms"
            titre="Choisissez un nom pour votre variable"
            sousTitre="Le plus de langues, le mieux !"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          />
        </v-menu>

        <p class="text-overline mb-2">Description</p>
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
              label="Description"
            />
          </template>
          <boîteNoms
            :noms="descriptions"
            titre="Que représente votre variable ?"
            sousTitre="Le plus de langues, le mieux !"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          />
        </v-menu>

        <p class="text-overline mb-2">Catégorie</p>
        <v-select v-model="catégorie" :items="optionsCatégories" outlined dense>
          <template v-slot:item="{ on, item }">
            <v-list-item v-on="on">
              <v-list-item-avatar>
                <v-icon>{{ item.icône }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                {{ $t(`variables.catégories.${item.text}`) }}
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

        <p class="text-overline mb-0">Contrôles de qualité</p>
        <v-list>
          <v-list-item @click="ajouterRègle;">
            <v-list-item-avatar>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-avatar>
            <v-list-item-content> Ajouter une règle </v-list-item-content>
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
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn color="primary" :disabled="!prêt" depressed @click="sauvegarder">
          {{ $t("communs.sauvegarder") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import boîteNoms from "@/components/commun/boîteNoms/boîte";
import mixinLangues from "@/mixins/langues";

import {
  traduireNom,
  catégoriesVariable,
  icôneCatégorieVariable,
} from "@/utils";

export default {
  name: "dialogueNouvelleVariable",
  components: { boîteNoms },
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      catégorie: null,
      noms: {},
      descriptions: {},
      unités: undefined,

      règlesCatégorie: [],
      règlesPropre: [],
    };
  },
  watch: {
    variable: async function (val) {
      if (this.oublierRèglesVariable) this.oublierRèglesVariable();
      if (val) {
        this.oublierRèglesVariable =
          await this.$ipa.variables.suivreRèglesVariable(val, (règles) => {
            this.règlesVariable = règles;
          });
      }
    },
  },
  computed: {
    prêt: function () {
      return Object.keys(this.noms).length && this.catégorie;
    },
    optionsCatégories: () => {
      return catégoriesVariable.map((x) => {
        return { text: x, icône: icôneCatégorieVariable(x) };
      });
    },
    nom: function () {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : undefined;
    },
    descr: function () {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : undefined;
    },
  },
  methods: {
    nouvelleVariable: function ({ id }) {
      this.variable = id;
    },
    sauvegarderNom: function ({ langue, nom }) {
      this.noms = { ...this.noms, [langue]: nom };
    },
    effacerNom: function ({ langue }) {
      this.noms = Object.fromEntries(
        Object.keys(this.noms)
          .filter((x) => x !== langue)
          .map((x) => [x, this.noms[x]])
      );
    },
    changerLangueNom: function ({ langueOriginale, langue, nom }) {
      this.effacerNom(langueOriginale);
      this.sauvegarderNom(langue, nom);
    },
    sauvegarderDescr: function ({ langue, nom }) {
      this.descriptions = { ...this.descriptions, [langue]: nom };
    },
    effacerDescr: function ({ langue }) {
      this.descriptions = Object.fromEntries(
        Object.keys(this.descriptions)
          .filter((x) => x !== langue)
          .map((x) => [x, this.descriptions[x]])
      );
    },
    changerLangueDescr: function ({ langueOriginale, langue, nom }) {
      this.effacerDescr(langueOriginale);
      this.sauvegarderDescr(langue, nom);
    },
    sauvegarder: async function () {
      const idVariable = await this.$ipa.variables.créerVariable(
        this.catégorie
      );
      await this.$ipa.variables.ajouterNomsVariable(idVariable, this.noms);
      await this.$ipa.variables.ajouterDescriptionsVariable(
        idVariable,
        this.descriptions
      );
      if (this.unités) {
        await this.$ipa.variables.ajouterUnitésVariable(
          idVariable,
          this.unités
        );
      }
      this.$emit("sauvegarde", { id: idVariable });
    },
    ajouterRègle: function () {
      console.warn("À faire");
    },
  },
};
</script>

<style></style>
