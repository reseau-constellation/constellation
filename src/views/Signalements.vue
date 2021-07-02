<template>
  <v-container class="text-center">
    <titre
      :entête="$t('signalements.entête')"
      :image="image('problème')"
      :soustitre="$t('signalements.soustitre')"
    />
    <v-btn
      tiled
      outlined
      class="mx-2"
      @click="
        ouvrirLien('https://github.com/julienmalard/constellation/issues')
      "
      append
    >
      {{ $t("signalements.bouton") }}
      <v-icon right> mdi-open-in-new </v-icon>
    </v-btn>
    <v-btn
      class="mx-2"
      tiled
      outlined
      href="mailto:julien.malard@mail.mcgill.ca"
      append
    >
      {{ $t("signalements.boutonCourriel") }}
      <v-icon right> mdi-email </v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { ouvrirLien } from "@/utils";

import Titre from "@/components/commun/Titre.vue";
import mixinImage from "@/mixins/images";

export default {
  name: "Signalements",
  components: { Titre },
  mixins: [mixinImage],
  methods: { ouvrirLien },
};
</script>

<style></style>
