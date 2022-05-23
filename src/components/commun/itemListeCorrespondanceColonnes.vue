<template>
  <v-list-item>
    <v-list-item-content>
      <v-row align="center">
        <v-col cols="6">
          <v-chip outlined label>
            {{ corresp.colFichier }}
          </v-chip>
        </v-col>
        <v-col cols="6">
          <jeton-variable :id="idVariable" />
        </v-col>
      </v-row>
    </v-list-item-content>

    <v-list-item-action>
      <v-btn icon color="error">
        <v-icon @click="effacer">mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { PropType } from "vue";
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";

import jetonVariable from "@/components/commun/jetonVariable.vue";

export default mixins(mixinLangues).extend({
  name: "itemNom",
  props: {
    corresp: Object as PropType<{ colFichier: string, colConstellation: string, conv?: string | number }>,
    idVariable: String
  },
  components: { jetonVariable },
  mixins: [mixinLangues],
  methods: {
    effacer: function () {
      this.$emit("effacer");
    },
  },
});
</script>

<style></style>
