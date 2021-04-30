<template>
  <v-menu offset-x :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-chip outlined label small v-bind="attrs" v-on="on" class="mx-1 my-1">
        <v-icon v-if="catégorie" left small>{{ icôneCatégorie }}</v-icon>
        {{ couper(nom, 10) }}
      </v-chip>
    </template>
    <carte-variable :id="id" />
  </v-menu>
</template>

<script>
import { traduireNom, couper, icôneCatégorieVariable } from "@/utils";
import carteVariable from "@/components/commun/carteVariable";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default {
  name: "jetonVariable",
  props: ["id"],
  components: { carteVariable },
  mixins: [mixinLangues, mixinIPA],
  data: function() {
    return {
      noms: {},
      catégorie: undefined
    };
  },
  computed: {
    nom: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.replace(/^\/orbitdb\//, "");
    },
    icôneCatégorie: function() {
      return icôneCatégorieVariable(this.catégorie);
    }
  },
  methods: {
    couper,
    initialiserSuivi: async function() {
      const oublierNoms = await this.$ipa.variables.suivreNomsVariable(
        this.id,
        noms => {
          this.noms = noms;
        }
      );

      const oublierCatégorie = await this.$ipa.variables.suivreCatégorieVariable(
        this.id,
        catégorie => {
          this.catégorie = catégorie;
        }
      );

      this.suivre([oublierNoms, oublierCatégorie]);
    }
  }
};
</script>

<style></style>
