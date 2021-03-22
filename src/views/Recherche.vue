<template>
  <v-container class="text-center">
    <titre
      :entête="$t('recherche.entête')"
      :image="image('recherche')"
      :soustitre="$t('recherche.soustitre')"
    />
    <v-text-field outlined class="mx-10 mt-0"></v-text-field>
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import mixinImage from "@/mixins/images";

export default {
  name: "Recherche",
  components: { Titre },
  mixins: [mixinImage]
};
</script>

<style></style>
