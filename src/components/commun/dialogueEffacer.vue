<template>
  <v-dialog v-model="dialogue" width="500">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline red--text">
        {{ titre }}
      </v-card-title>
      <v-card-text>
        {{ explication }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text outlined @click="dialogue = false">
          {{ $t("bd.visBD.இல்லை") }}
        </v-btn>
        <v-btn color="error" depressed @click="effacer">
          {{ $t("bd.visBD.நீக்கவும்") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "dialogueEffacer",
  props: {
    titre: {
      type: String,
    },
    explication: {
      type: String,
    },
  },
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      dialogue: false,
    };
  },
  methods: {
    effacer: function () {
      this.$emit("effacer");
      this.dialogue = false;
    },
  },
});
</script>

<style></style>
