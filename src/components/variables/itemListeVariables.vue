<template>
  <v-list-item>
    <v-list-item-avatar>
      <v-icon>mdi-xml</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>{{ nom }}</v-list-item-title>
      <v-list-item-subtitle>{{ descr }}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <span>
        <v-btn icon>
          <v-icon>{{
            épinglé && épinglé.bd ? "mdi-pin" : "mdi-pin-outline"
          }}</v-icon>
        </v-btn>
        <v-btn
          v-if="permissionÉcrire"
          icon
          color="error"
          @click.stop="effacerVariable"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </span>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";
import { traduireNom, couper } from "@/utils";

import { favoris } from "@constl/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemListeVariables",
  props: ["id"],
  mixins: [mixinIPA, mixinLangues],
  data: function () {
    return {
      noms: {} as { [key: string]: string },
      descriptions: {} as { [key: string]: string },
      permissionÉcrire: false,
      épinglé: undefined as undefined | favoris.épingleDispositif,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : couper(this.id, 30);
    },
    descr: function (): string {
      return Object.keys(this.descriptions).length
        ? traduireNom(this.descriptions, this.languesPréférées)
        : "";
    },
  },
  methods: {
    couper,
    effacerVariable: async function () {
      await this.$ipa.variables!.effacerVariable({ id: this.id });
    },
    initialiserSuivi: async function () {
      const oublierPermissionÉcrire = await this.$ipa.suivrePermissionÉcrire({
        id: this.id,
        f: (permission) => (this.permissionÉcrire = permission),
      });

      const oublierNoms = await this.$ipa.variables!.suivreNomsVariable({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      const oublierDescriptions =
        await this.$ipa.variables!.suivreDescrVariable({
          id: this.id,
          f: (descriptions) => {
            this.descriptions = descriptions;
          },
        });

      const oublierÉpinglé =
        await this.$ipa.favoris!.suivreEstÉpingléSurDispositif({
          idObjet: this.id,
          f: (épinglé) => {
            this.épinglé = épinglé;
          },
        });

      this.suivre([
        oublierPermissionÉcrire,
        oublierNoms,
        oublierDescriptions,
        oublierÉpinglé,
      ]);
    },
  },
});
</script>

<style></style>
