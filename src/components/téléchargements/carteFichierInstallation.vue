<template>
  <v-card class="ma-3 pa-5" max-width="300" @click="ouvrirLien(url)">
    <v-img :src="img" contain max-height="150"></v-img>
    <v-card-title>
      {{ SO }}
      <v-spacer />
      <v-btn icon><v-icon>mdi-download</v-icon></v-btn>
    </v-card-title>
    <v-card-text
      >Constellation version
      {{
        version
          .split(".")
          .map((x) => formatterChiffre(x))
          .join(".")
          .replace(/\.\./g, ".")
          .replace(/\.$/, "")
      }}</v-card-text
    >
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { ouvrirLien } from "@/utils";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "carteFichierInstallation",
  props: ["url", "SO", "img", "version"],
  mixins: [mixinLangues],
  methods: { ouvrirLien },
});
</script>

<style></style>
