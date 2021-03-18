<template>
  <v-container class="text-center">
    <titre
      :entête="$t('signalements.entête')"
      :image="require('@/assets/undraw/undraw_towing_6yy4.svg')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"

export default {
  name: "Signalements",
  components: { Titre }
};
</script>

<style></style>
