<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>{{ icôneCatégorieVariable(colonne.catégorie) }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      {{ couper(nom, 30) }}
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";
import { icôneCatégorieVariable } from "@/utils";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeColonnes",
  props: ["colonne"],
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.colonne.id.slice(9);
    },
  },
  methods: {
    couper,
    icôneCatégorieVariable,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.colonne.variable,
        f: (noms) => {
          this.noms = noms;
        },
      });

      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
