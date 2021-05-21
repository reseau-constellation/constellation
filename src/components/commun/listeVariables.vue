<template>
  <span>
    <jeton-variable v-for="vr in visibles" :key="vr" :id="vr" />
    <v-menu v-if="extras.length" offset-y open-on-hover>
      <template v-slot:activator="{ on, attrs }">
        <v-chip v-bind="attrs" v-on="on" outlined label small class="me-1 my-1">
          ...
        </v-chip>
      </template>
      <v-card flat class="pa-2" max-width="200">
        <jeton-variable v-for="vr in extras" :key="vr" :id="vr" />
      </v-card>
    </v-menu>
  </span>
</template>

<script>
import jetonVariable from "@/components/commun/jetonVariable";

export default {
  name: "listeVariables",
  props: ["variables", "nMax"],
  components: { jetonVariable },
  computed: {
    visibles: function () {
      return this.variables.slice(0, this.nMax);
    },
    extras: function () {
      return this.variables.slice(this.nMax);
    },
  },
};
</script>

<style></style>
