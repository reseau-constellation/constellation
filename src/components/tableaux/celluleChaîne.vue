<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val">
          {{ couper(val, 20) }}
        </span>
        <span v-else-if="editer">
          <v-icon>mdi-plus</v-icon>
        </span>
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

<script>
import { couper } from "@/utils";

export default {
  name: "celluleChaîne",
  props: ["val", "editer"],
  data: function() {
    return {
      valÉditée: this.val
    };
  },
  methods: { couper }
};
</script>

<style></style>
