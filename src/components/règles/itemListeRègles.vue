<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>{{ icône }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <span v-if="regle.règle.typeRègle === 'bornes'">
        {{ regle }}
        {{ nomVariable }}
        {{ regle.règle.détails.op }}
        <v-text-input v-if="editable"></v-text-input>
        <span v-else>{{
          $t("itemListeRègles.catégorie.descr", {
            nomVariable,
            cat: regle.règle.détails.val,
          })
        }}</span>
      </span>
      <span v-if="regle.règle.typeRègle === 'catégorie'">
        {{ nomVariable }}
        <v-text-input v-if="editable"></v-text-input>
        <span v-else>{{
          $t("itemListeRègles.catégorie.descr", {
            nomVariable,
            cat: regle.règle.détails.catégorie,
          })
        }}</span>
      </span>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import { PropType } from "vue";

import mixinLangues from "@/mixins/langues";

import { valid } from "@constl/ipa";

import {
  icôneCatégorieVariable,
} from "@/utils";

export default mixins(mixinLangues).extend({
  name: "itemListeRègles",
  props: {
    regle: {
      type: Object as PropType<valid.règleVariableAvecId>,
    },
    editable: Boolean,
    nomVariable: String,
  },
  data: function () {
    return {
      nomsVar: {} as { [key: string]: string },
      icôneCatégorieVariable,
    };
  },
  computed: {
    icône: function (): string {
      switch (this.regle.règle.typeRègle) {
        case "catégorie":
          return icôneCatégorieVariable(
            this.regle.règle.détails.catégorie as string
          );

        case "bornes":
          return "mdi-view-list";

        case "valeurCatégorique":
          return "mdi-view-list";

        case "existe":
          return "mdi-view-list";

        default:
          return "mdi-xml";
      }
    },
  },
});
</script>

<style></style>
