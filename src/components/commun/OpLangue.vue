<template>
  <v-layout align-center @click="$emit('click')">
    <v-list-item-action>
      <v-icon v-if="sélectionnée" color="primary"> mdi-check-bold </v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ codeÀNomLangue(code) || code }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-icon v-if="progrès === 1" color="primary">mdi-check-circle</v-icon>
      <v-progress-circular
        v-else
        :value="progrès * 100"
        size="20"
        rotate="270"
        color="primary"
      ></v-progress-circular>
    </v-list-item-action>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import { rubiChabäl as codeÀNomLangue } from "nuchabal";

export default Vue.extend({
  name: "opsLangue",
  props: {
    sélectionnée: Boolean,
    progrès: Number,
    code: String,
  },
  methods: { codeÀNomLangue },
});
</script>

<style></style>
