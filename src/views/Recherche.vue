<template>
  <v-container class="text-center">
    <titre
      :entête="$t('recherche.entête')"
      :image="require('@/assets/undraw/undraw_not_found_60pq.svg')"
      :soustitre="$t('recherche.soustitre')"
    />
    <v-text-field outlined class="mx-10 mt-0"></v-text-field>
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"

export default {
  name: "Recherche",
  components: { Titre }
};
</script>

<style></style>
