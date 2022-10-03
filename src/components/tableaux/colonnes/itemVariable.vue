<template>
  <v-list-item>
    <v-list-item-avatar>
      <v-icon>{{ icôneCatégorie }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content class="text--primary">
      <texteTronqué :texte="nom" :longueurMax="25" />
      <v-list-item-subtitle class="text--secondary">
        <texteTronqué :texte="descr" :longueurMax="50" />
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

import { traduireNom,  icôneCatégorieVariable } from "@/utils";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import texteTronqué from "@/components/commun/texteTronqué.vue";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemAuteur",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { lienOrbite, texteTronqué },
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
    
    effacerVariable: async function () {
      await this.$ipa.variables!.effacerVariable({ id: this.id });
    },
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.id,
        f: (noms) => (this.noms = noms),
      });

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable({
          id: this.id,
          f: (descrs) => (this.descriptions = descrs),
        });

      const oublierCatégorie =
        await this.$ipa.variables!.suivreCatégorieVariable({
          id: this.id,
          f: (catégorie) => {
            this.catégorie = catégorie;
          },
        });

      this.suivre([oublierCatégorie, oublierNoms, oublierDescriptions]);
    },
  },
});
</script>

<style></style>
