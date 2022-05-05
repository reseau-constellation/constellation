<template>
  <v-container class="text-center">
    <titre
      :entête="$t('automatisation.entête')"
      :image="image('automatisation')"
      :soustitre="$t('automatisation.soustitre')"
    />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import mixinImage from "@/mixins/images";

export default {
  name: "PageAutomatisation",
  components: { Titre },
  mixins: [mixinImage],
};
</script>

<style></style>
