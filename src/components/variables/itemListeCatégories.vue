<template>
  <v-list-item>
    <v-list-item-avatar>
      <v-icon>{{ icône }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      {{ $t(`variables.catégories.${categorie}`) }}
      <v-list-item-subtitle>
        {{ $t("variables.catégories.info." + categorie) }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";
import mixinLangues from "@/mixins/langues";

import {
  icôneCatégorieVariable,
} from "@/utils";

export default mixins(mixinLangues).extend({
  name: "itemListeCatégories",
  props: {
    categorie: {
      type: String
    }
  },
  computed: {
    icône: function (): string {
      return icôneCatégorieVariable(this.categorie)
    }
  }
})

</script>

<style></style>
