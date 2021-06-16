<template>
  <v-card class="ma-3 pa-5" max-width="300" @click="ouvrirLien(url)">
    <v-img :src="img" contain max-height="150"></v-img>
    <v-card-title>
      {{ SO }}
      <v-spacer />
      <v-btn icon><v-icon>mdi-download</v-icon></v-btn>
    </v-card-title>
    <v-card-text>Constellation version {{ version }}</v-card-text>
  </v-card>
</template>

<script>
import { ouvrirLien } from "@/utils";

export default {
  name: "carteFichierInstallation",
  props: ["url", "SO", "img", "version"],
  methods: { ouvrirLien },
};
</script>

<style></style>
