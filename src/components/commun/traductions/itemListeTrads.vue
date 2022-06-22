<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-content>
      <v-list-item-title>
        {{ couper(traduction || '[' + $t('itemListeTrads.இல்லை') + ']', 30) }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ couper(texteOriginal || clef, 30) }}
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
