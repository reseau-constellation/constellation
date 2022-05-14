<template>
  <v-menu offset-x :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-chip outlined label small v-bind="attrs" v-on="on" class="mx-1 my-1">
        <v-icon v-if="catégorie" left small>{{ icôneCatégorie }}</v-icon>
        {{ couper(nom, longueur) }}
      </v-chip>
    </template>
    <carte-variable :id="id" />
  </v-menu>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { traduireNom, couper, icôneCatégorieVariable } from "@/utils";

import carteVariable from "@/components/commun/carteVariable.vue";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "jetonVariable",
  props: {
    longueur: {
      type: Number,
      default: 10,
    },
    id: String,
  },
  components: { carteVariable },
  mixins: [mixinLangues, mixinIPA],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      catégorie: undefined as undefined | string,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.replace(/^\/orbitdb\//, "");
    },
    icôneCatégorie: function (): string | undefined {
      if (!this.catégorie) return;
      return icôneCatégorieVariable(this.catégorie);
    },
  },
  watch: {
    id: function () {
      this.réInitialiserSuivi();
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable({
          id: this.id,
          f: (catégorie) => {
            this.catégorie = catégorie;
          },
        });

      this.suivre([oublierNoms, oublierCatégorie]);
    },
  },
});
</script>

<style></style>
