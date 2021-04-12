<template>
  <v-card min-width="300">
    <v-card-title>
      {{ nom }}
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
    <v-card-subtitle>{{ description }}</v-card-subtitle>
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
        <v-chip v-if="catégorie!==undefined" label outlined small>
          <v-icon left small>{{ icôneCatégorie }}</v-icon>
          {{ catégorie }}
        </v-chip>
        <v-select v-else outlined dense :items="catégoriesVariable" @change="sauvegarderCategorie">
        </v-select>
      </p>

    </v-card-text>
  </v-card>
</template>

<script>
import { traduireNom, icôneCatégorieVariable, catégoriesVariable } from "@/utils";
import { rubiChabäl as codeÀNomLangue } from "nuchabal";
import lienOrbite from "@/components/commun/lienOrbite";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import boîteNoms from "@/components/commun/boîteNoms/boîte";

export default {
  name: "carteVariable",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, boîteNoms },
  data: function() {
    return {
      noms: {},
      descriptions: {},
      unités: undefined,
      permissionÉcrire: false,
      catégorie: undefined,
      catégoriesVariable
    };
  },
  computed: {
    nom: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
    description: function() {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées) : "";
    },
    icôneCatégorie: function() {
      return icôneCatégorieVariable(this.catégorie)
    }
  },
  methods: {
    codeÀNomLangue,
    sauvegarderCategorie: async function(catégorie) {
      await this.$ipa.variables.sauvegarderCatégorieVariable(this.id, catégorie);
    },
    initialiserSuivi: async function() {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.id);

      const oublierNoms = await this.$ipa.variables.suivreNomsVariable(
        this.id,
        noms => {
          this.noms = noms;
        }
      );

      const oublierDescriptions = await this.$ipa.variables.suivreDescrVariable(
        this.id,
        descrs => {
          this.descriptions = descrs;
        }
      );

      const oublierCatégorie = await this.$ipa.variables.suivreCatégorieVariable(
        this.id,
        catégorie => {
          this.catégorie = catégorie
        }
      );

      const oublierUnités = await this.$ipa.variables.suivreUnitésVariable(
        this.id,
        unités => {
          this.unités = unités;
        }
      );

      this.suivre([oublierNoms, oublierDescriptions, oublierCatégorie, oublierUnités]);
    }
  }
};
</script>

<style></style>
