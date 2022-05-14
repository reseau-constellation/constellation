<template>
  <v-menu offset-x :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        {{ couper(titre, 20) }}
      </span>
    </template>
    <carte-variable :id="idVariable" />
  </v-menu>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import carteVariable from "@/components/commun/carteVariable.vue";

import { traduireNom, couper } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "titreEntêteTableau",
  props: ["idVariable", "idColonne"],
  mixins: [mixinLangues, mixinIPA],
  components: { carteVariable },
  data: function () {
    return {
      noms: {},
    };
  },
  computed: {
    titre: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.idColonne;
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.idVariable,
        f: (noms) => {
          this.noms = noms;
        },
      });
      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
