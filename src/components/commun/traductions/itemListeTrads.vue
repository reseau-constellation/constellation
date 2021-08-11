<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-content>
      <v-card outlined max-width="300" class="mx-4 mb-2">
        <v-card-text class="text--primary">
          {{ texteOriginal || clef }}
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 text--secondary">
          <v-icon left small>mdi-xml</v-icon>
          {{ couper(clef, 30) }}
        </v-card-actions>
      </v-card>
      <v-card outlined max-width="300" class="mx-4 mb-2">
        <v-card-text :class="`text--${traduction ? 'primary' : 'disabled'}`">
          {{ traduction || "[Aucune traduction]" }}
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 text--secondary">
          <v-icon left small>mdi-xml</v-icon>
          {{ couper(clef, 30) }}
        </v-card-actions>
      </v-card>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { couper } from "@/utils";

import mixinLangues from "@/mixins/langues";

export default {
  name: "itemListeTrads",
  props: ["clef", "texteOriginal", "traduction"],
  mixins: [mixinLangues],
  methods: {
    couper,
  },
};
</script>

<style></style>
