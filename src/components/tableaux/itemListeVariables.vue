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

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { traduireNom, couper } from "@/utils";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeVariables",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      permissionÉcrire: false,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : couper(this.id, 30);
    },
  },
  methods: {
    couper,
    effacerVariable: async function () {
      await this.$ipa.variables!.effacerVariable(this.id);
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire(
        this.id,
        (permission) => (this.permissionÉcrire = permission)
      );

      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );

      this.suivre([oublierNoms, oublierPermissionÉcrire]);
    },
  },
});
</script>

<style></style>
