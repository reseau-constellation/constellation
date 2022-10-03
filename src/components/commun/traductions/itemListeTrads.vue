<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-avatar size="20">
      <v-icon v-if="traduction">mdi-check</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ couper(texteOriginal || clef, 30) }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ couper(traduction || "[" + $t("itemListeTrads.இல்லை") + "]", 30) }}
      </v-list-item-subtitle>
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
