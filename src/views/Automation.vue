<template>
  <v-container class="text-center">
    <titre
      :entête="$t('automation.entête')"
      :image="image('automation')"
      :soustitre="$t('automation.soustitre')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import mixinImage from "@/mixins/images";

export default {
  name: "Compte",
  components: { Titre },
  mixins: [mixinImage],
};
</script>

<style></style>
