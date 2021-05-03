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

<script>
import { traduireNom, couper } from "@/utils";
import carteVariable from "@/components/commun/carteVariable";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default {
  name: "titreEntêteTableau",
  props: ["idVariable", "idColonne"],
  mixins: [mixinLangues, mixinIPA],
  components: { carteVariable },
  data: function() {
    return {
      noms: {}
    };
  },
  computed: {
    titre: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.idColonne;
    }
  },
  methods: {
    couper,
    initialiserSuivi: async function() {
      const oublierNoms = await this.$ipa.variables.suivreNomsVariable(
        this.idVariable,
        noms => {
          this.noms = noms;
        }
      );
      this.suivre([oublierNoms]);
    }
  }
};
</script>

<style></style>
