<template>
  <v-list-item v-bind="$attrs" v-on="$listeners">
    <v-list-item-avatar>
      <v-icon>{{ icône }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <span v-if="règle.typeRègle === 'bornes'">
        {{ nomVariable }}
        {{ règle.détails.op }}
        <v-text-input v-if="editable"></v-text-input>
        <span v-else>{{ règle.détails.val }}</span>
      </span>

    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import { PropType } from "vue";

import boîteNoms from "@/components/commun/boîteNoms/boîte.vue";

import mixinLangues from "@/mixins/langues";

import { valid, variables } from "@constl/ipa";

import {
  traduireNom,
  catégoriesVariable,
  icôneCatégorieVariable,
} from "@/utils";


export default mixins(mixinLangues).extend({
  name: "itemListeRègles",
  props: {
    règle: {
      type: Object as PropType<valid.règleVariableAvecId>,
    },
    editable: Boolean,
    nomVariable: String,
  },
  computed: {
    icône: function (): string {
      switch (this.règle.règle.typeRègle) {
        case "catégorie":
          return "mdi-view-list"

        case "bornes":
          return "mdi-view-list"

        case "valeurCatégorique":
          return "mdi-view-list"

        case "existe":
          return "mdi-view-list"

        default:
          return "mdi-xml";
      }
    }
  }
})

</script>

<style>
</style>
