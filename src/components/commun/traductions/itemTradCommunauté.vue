<template>
  <v-list-item>
    <v-list-item-avatar>
      <avatar-profil :id="idAuteur" />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title> {{ couper(nom, 20) }} </v-list-item-title>
      <v-list-item-subtitle> {{ date }} </v-list-item-subtitle>
      <v-divider />
      <span class="text--secondary">{{ traduction }}</span>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import { couper } from "@/utils";

import { suggestionTrad } from "./types";

export default mixins(mixinLangues).extend({
  name: "itemTradCommunauté",
  props: {
    suggestion: {
      type: Object as () => suggestionTrad,
    },
  },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
    };
  },
  computed: {
    idAuteur: function (): string {
      return this.suggestion.idBdAuteur;
    },
    traduction: function (): string {
      return this.suggestion.élément.payload.value.traduction;
    },
    date: function (): string {
      const date = this.suggestion.élément.payload.value.date;
      return this.formatterDate(date);
    },
  },
  methods: {
    couper,
  },
});
</script>

<style></style>
