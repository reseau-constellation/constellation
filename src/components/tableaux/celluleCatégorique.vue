<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val" :class="{ 'primary--text': editer }">
          <texteTronqué :texte="nom" :longueurMax="20" />
        </span>
        <v-btn v-else-if="editer" small icon>
          <v-icon small :color="couleurActive">mdi-pencil-plus</v-icon>
        </v-btn>
      </span>
    </template>
    <v-card class="pa-2">
      <v-text-field
        v-model="valÉditée"
        :value="val"
        @blur="$emit('edite', { val: valÉditée })"
      />
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import Vue from "vue";

import texteTronqué from "@/components/commun/texteTronqué.vue";

export default Vue.extend({
  name: "celluleCatégorique",
  props: ["val", "editer", "couleurActive"],
  components: { texteTronqué },
  data: function () {
    return {
      valÉditée: this.val,
    };
  },
});
</script>

<style></style>
