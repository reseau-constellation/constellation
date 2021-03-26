<template>
  <v-menu offset-x :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-chip outlined label small v-bind="attrs" v-on="on" class="mx-1 my-1">
        {{ couper(nom, 15) }}
      </v-chip>
    </template>
    <carte-variable :id="id" />
  </v-menu>
</template>

<script>
import { traduireNom, couper } from "@/utils";
import { obtNomsVariable } from "@/ipa/variables";
import carteVariable from "@/components/commun/carteVariable";

export default {
  name: "jetonVariable",
  props: ["id"],
  components: { carteVariable },
  data: function() {
    return {
      noms: null
    };
  },
  methods: { couper },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return this.noms ? traduireNom(this.noms, this.langues) : this.id;
    }
  },
  mounted: async function() {
    this.noms = await obtNomsVariable(this.id);
  }
};
</script>

<style></style>
