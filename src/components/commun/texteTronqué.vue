<template>
  <v-tooltip :disabled="!tropLong" open-delay="250" bottom>
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">{{ texteCourt }}</span>
    </template>
    <span>{{ texte }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

export default mixins().extend({
  name: "texteTronqué",
  props: ["texte", "longueurMax"],
  data: function () {
    return {};
  },
  computed: {
    tropLong: function (): boolean {
      return [...this.texte].length > this.longueurMax;
    },
    texteCourt: function (): string {
      if ([...this.texte].length <= this.longueurMax) {
        return this.texte;
      } else {
        return this.texte.slice(0, this.longueurMax - 3).concat("...");
      }
    },
  },
});
</script>

<style></style>
