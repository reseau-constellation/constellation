<template>
  <v-card min-width="300">
    <v-card-title>
      {{ couper(nom, 20) }}
      <span v-if="permissionÉcrire">
        <v-menu
          offset-x
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-on="on" v-bind="attrs">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <boîteNoms
            :noms="noms"
            @sauvegarder="sauvegarderNom"
            @changerLangue="changerLangueNom"
            @effacer="effacerNom"
          />
        </v-menu>
      </span>
      <v-spacer />
      <lien-orbite :lien="id" />
    </v-card-title>
    <v-card-subtitle>
      {{ couper(description, 45) }}
      <span v-if="permissionÉcrire">
        <v-menu
          offset-x
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-on="on" v-bind="attrs">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <boîteNoms
            :noms="descriptions"
            @sauvegarder="sauvegarderDescr"
            @changerLangue="changerLangueDescr"
            @effacer="effacerDescr"
          />
        </v-menu>
      </span>
    </v-card-subtitle>
    <v-divider />
    <v-card-text>
      <p class="mb-0 text-overline">
        Unités
        <v-chip label outlined small>
          {{ unités ? unités : "Aucune unité" }}
        </v-chip>
      </p>
      <p class="mb-0 text-overline">
        Catégorie
        <v-chip v-if="catégorie !== undefined" label outlined small>
          <v-icon left small>{{ icôneCatégorie }}</v-icon>
          {{ catégorie }}
        </v-chip>
        <v-select
          v-else
          outlined
          dense
          :items="catégoriesVariable"
          @change="sauvegarderCategorie"
        >
        </v-select>
      </p>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { catégorieVariables } from "@constl/ipa/lib/variables";

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

export default mixins(mixinLangues, mixinIPA).extend({
  name: "carteVariable",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, boîteNoms },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      unités: undefined as undefined | string,
      permissionÉcrire: false,
      catégorie: undefined as undefined | string,
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
      await this.$ipa.variables!.ajouterNomsVariable(this.id, {
        [langue]: nom,
      });
    },
    effacerNom: async function ({ langue }: { langue: string }) {
      await this.$ipa.variables!.effacerNomVariable(this.id, langue);
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
      await this.$ipa.variables!.effacerNomVariable(this.id, langueOriginale);
      await this.$ipa.variables!.ajouterNomsVariable(this.id, {
        [langue]: nom,
      });
    },
    sauvegarderDescr: async function ({
      langue,
      nom,
    }: {
      langue: string;
      nom: string;
    }) {
      await this.$ipa.variables!.ajouterDescriptionsVariable(this.id, {
        [langue]: nom,
      });
    },
    effacerDescr: async function ({ langue }: { langue: string }) {
      await this.$ipa.variables!.effacerDescrVariable(this.id, langue);
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
      await this.$ipa.variables!.effacerDescrVariable(this.id, langueOriginale);
      await this.$ipa.variables!.ajouterDescriptionsVariable(this.id, {
        [langue]: nom,
      });
    },
    sauvegarderCategorie: async function (catégorie: catégorieVariables) {
      await this.$ipa.variables!.sauvegarderCatégorieVariable(
        this.id,
        catégorie
      );
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire(
        this.id,
        (permission) => (this.permissionÉcrire = permission)
      );

      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable(this.id, (descrs) => {
          this.descriptions = descrs;
        });

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable(
          this.id,
          (catégorie) => {
            this.catégorie = catégorie;
          }
        );

      const oublierUnités = await this.$ipa.variables!.suivreUnitésVariable(
        this.id,
        (unités) => {
          this.unités = unités;
        }
      );

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
        oublierDescriptions,
        oublierCatégorie,
        oublierUnités,
      ]);
    },
  },
});
</script>

<style></style>
