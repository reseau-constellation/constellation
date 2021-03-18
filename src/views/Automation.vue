<template>
  <v-container class="text-center">
    <titre
      :entête="$t('automation.entête')"
      :image="require('@/assets/undraw/undraw_real-time_sync_o57k.svg')"
      :soustitre="$t('automation.soustitre')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"

export default {
  name: "Compte",
  components: { Titre }
};
</script>

<style></style>
