<template>
  <v-row class="mt-3 text-center">
    <v-col>
      <h1 class="display-2 font-weight-bold">
        {{ entête }}
      </h1>
    </v-col>
    <v-col v-if="image" cols="12">
      <v-avatar v-if="imageRonde" size="175" class="mb-3">
        <v-img :src="image" />
      </v-avatar>
      <v-img v-else :src="image" class="mb-3" contain height="175" />
    </v-col>
    <v-col v-if="soustitre" cols="12">
      <h2 class="headline font-weight-bold mb-5">
        {{ soustitre }}
      </h2>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "TitrePage",
  props: ["entête", "soustitre", "image", "imageRonde"],
});
</script>

<style></style>
