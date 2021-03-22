<template>
  <v-container class="text-center">
    <titre
      :entête="$t('favoris.entête')"
      :image="image('favoris')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"
import mixinImage from "@/mixins/images";

export default {
  name: "Favoris",
  components: { Titre },
  mixins: [mixinImage]
};
</script>

<style></style>
