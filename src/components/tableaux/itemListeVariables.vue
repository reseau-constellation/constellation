<template>
  <v-list-item>
    <v-list-item-content>
      {{ nom }}
    </v-list-item-content>
    <v-list-item-action v-if="permissionÉcrire">
      <v-btn icon color="error" @click.stop="effacerVariable">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { traduireNom, couper } from "@/utils";

export default {
  name: "itemListeVariables",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      noms: {},
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function () {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : couper(this.id, 30);
    },
  },
  methods: {
    couper,
    effacerVariable: async function () {
      await this.$ipa.variables.effacerVariable(this.id);
    },
    initialiserSuivi: async function () {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.id);

      const oublierNoms = await this.$ipa.variables.suivreNomsVariable(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );

      this.suivre([oublierNoms]);
    },
  },
};
</script>

<style></style>
