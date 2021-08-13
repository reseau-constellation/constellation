<template>
  <v-alert
    type="warning"
    border="left"
    outlined
    class="text-left mx-auto my-10"
    max-width="650"
  >
    <p>{{ $t("alerteConditions.texte") }}</p>
    <v-btn
      tiled
      small
      outlined
      color="warning"
      @click="$router.push('/conditions')"
    >
      {{ $t("alerteConditions.bouton") }}
    </v-btn>
  </v-alert>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "alerteConditions",
});
</script>

<style></style>
