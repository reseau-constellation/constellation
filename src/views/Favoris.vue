<template>
  <v-container class="text-center">
    <titre
      :entête="$t('favoris.entête')"
      :image="require('@/assets/undraw/undraw_Appreciation_re_p6rl.svg')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"

export default {
  name: "Favoris",
  components: { Titre }
};
</script>

<style></style>
