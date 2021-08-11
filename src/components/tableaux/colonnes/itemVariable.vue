<template>
  <v-list-item>
    <v-list-item-avatar>
      <v-icon>{{ icôneCatégorie }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content class="text--primary">
      {{ couper(nom, 25) }}
      <v-list-item-subtitle class="text--secondary">
        {{ couper(descr, 50) }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <lien-orbite :lien="id" />
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import lienOrbite from "@/components/commun/lienOrbite.vue";

import { traduireNom, couper, icôneCatégorieVariable } from "@/utils";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemAuteur",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite },
  data: function () {
    return {
      dialogue: false,
      noms: {},
      descriptions: {},
      catégorie: undefined as string | undefined,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
    descr: function (): string {
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
    effacerVariable: async function () {
      await this.$ipa.variables!.effacerVariable(this.id);
    },
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable(
        this.id,
        (noms) => (this.noms = noms)
      );

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable(
          this.id,
          (descrs) => (this.descriptions = descrs)
        );

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable(
          this.id,
          (catégorie) => {
            this.catégorie = catégorie;
          }
        );

      this.suivre([oublierCatégorie, oublierNoms, oublierDescriptions]);
    },
  },
});
</script>

<style></style>
