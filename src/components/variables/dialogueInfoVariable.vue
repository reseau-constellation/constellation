<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>
    <v-card>
      <v-card-title>
        {{ couper(nom, 20) }}
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="noms"
            titre="bd.vis.boîteDescr.titre"
            etiquetteAucunNom="variables.boîteNoms.aucunNom"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </boîteNoms>
        </span>
        <v-spacer />
        <lien-orbite :lien="id" />
      </v-card-title>
      <v-card-subtitle>
        {{ description ? description : $t("bd.visBD.விளக்கம்") }}
        <span v-if="permissionÉcrire">
          <boîteNoms
            :noms="descriptions"
            titre="bd.vis.boîteDescr.titre"
            etiquetteAucunNom="bd.vis.boîteNoms.aucuneDescription"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-on="on" v-bind="attrs">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </boîteNoms>
        </span>
      </v-card-subtitle>
      <v-divider />
      <v-card-text>
        <p v-if="false" class="mb-0 text-overline">
          {{ $t("carteVariable.unités") }}
          <v-chip label outlined small>
            {{ unités ? unités : $t("carteVariable.Aucune_unité") }}
          </v-chip>
        </p>
        <p class="mb-0 text-overline">
          {{ $t("carteVariable.Catégorie") }}
          <v-select
            v-model="catégorie"
            outlined
            dense
            :items="catégoriesVariable"
            :disable="!permissionÉcrire"
            @change="sauvegarderCategorie"
          >
            <template v-slot:selection>
              <v-tooltip v-if="catégorie !== undefined" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-chip label outlined small v-on="on" v-bind="attrs">
                    <v-icon left small>{{ icôneCatégorie }}</v-icon>
                    {{ $t("variables.catégories." + catégorie) }}
                  </v-chip>
                </template>
                <span>
                  {{ $t("variables.catégories.info." + catégorie) }}
                </span>
              </v-tooltip>
            </template>
            <template v-slot:item="{ item, on, attrs }">
              <itemListeCatégories v-on="on" v-bind="attrs" :categorie="item" />
            </template>
          </v-select>
        </p>
        <p class="text-overline mb-0">
          {{ $t("dialogueNouvelleVariable.règles") }}
        </p>
        <v-list>
          <itemListeRègle
            v-for="r in règles"
            :key="r.id"
            :regle="r"
            :nomVariable="nom"
          >
          </itemListeRègle>
        </v-list>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { valid, variables } from "@constl/ipa";

import {
  couper,
  traduireNom,
  icôneCatégorieVariable,
  catégoriesVariable,
} from "@/utils";
import lienOrbite from "@/components/commun/lienOrbite.vue";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";
import itemListeRègle from "@/components/règles/itemListeRègles.vue";
import itemListeCatégories from "@/components/variables/itemListeCatégories.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueInfoVariable",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, boîteNoms, itemListeRègle, itemListeCatégories },
  data: function () {
    return {
      dialogue: false,

      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      unités: undefined as undefined | string,
      règles: [] as valid.règleVariableAvecId[],
      catégorie: undefined as undefined | string,

      permissionÉcrire: false,
      catégoriesVariable,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
    description: function (): string {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : "";
    },
    icôneCatégorie: function (): string {
      if (!this.catégorie) return "";
      return icôneCatégorieVariable(this.catégorie);
    },
  },
  methods: {
    couper,
    sauvegarderNom: async function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      await this.$ipa.variables!.ajouterNomsVariable({
        id: this.id,
        noms: {
          [langue]: nom,
        },
      });
    },
    effacerNom: async function ({ langue }: { langue: string }) {
      await this.$ipa.variables!.effacerNomVariable({ id: this.id, langue });
    },
    changerLangueNom: async function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      await this.$ipa.variables!.effacerNomVariable({
        id: this.id,
        langue: langueOriginale,
      });
      await this.$ipa.variables!.ajouterNomsVariable({
        id: this.id,
        noms: {
          [langue]: nom,
        },
      });
    },
    sauvegarderDescr: async function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      await this.$ipa.variables!.ajouterDescriptionsVariable({
        id: this.id,
        descriptions: {
          [langue]: nom,
        },
      });
    },
    effacerDescr: async function ({ langue }: { langue: string }) {
      await this.$ipa.variables!.effacerDescrVariable({ id: this.id, langue });
    },
    changerLangueDescr: async function ({
      langueOriginale,
      langue,
      nom,
    }: {
      langueOriginale: string;
      langue: string;
      nom: string;
    }) {
      await this.$ipa.variables!.effacerDescrVariable({
        id: this.id,
        langue: langueOriginale,
      });
      await this.$ipa.variables!.ajouterDescriptionsVariable({
        id: this.id,
        descriptions: {
          [langue]: nom,
        },
      });
    },
    sauvegarderCategorie: async function (
      catégorie: variables.catégorieVariables
    ) {
      await this.$ipa.variables!.sauvegarderCatégorieVariable({
        idVariable: this.id,
        catégorie,
      });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.id,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable({
          id: this.id,
          f: (descrs) => {
            this.descriptions = descrs;
          },
        });

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable({
          id: this.id,
          f: (catégorie) => {
            this.catégorie = catégorie;
          },
        });

      const oublierUnités = await this.$ipa.variables!.suivreUnitésVariable({
        id: this.id,
        f: (unités) => {
          this.unités = unités;
        },
      });

      const oublierRègles = await this.$ipa.variables!.suivreRèglesVariable({
        id: this.id,
        f: (règles) => {
          this.règles = règles;
        },
      });

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
        oublierDescriptions,
        oublierCatégorie,
        oublierUnités,
        oublierRègles,
      ]);
    },
  },
});
</script>

<style></style>
