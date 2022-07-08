<template>
  <v-container class="text-center justify-center">
    <titre
      :entête="$t('recherche.entête')"
      :image="image('recherche')"
      :soustitre="$t('recherche.soustitre')"
    />
    <v-text-field outlined class="mx-10 mt-0"></v-text-field>
    <v-radio-group v-model="catégorie" row>
      <v-radio :label="$t('recherche.Bases')" value="bds"></v-radio>
      <v-radio
        :label="$t('recherche.Projets')"
        value="projets"
        disabled
      ></v-radio>
      <v-radio :label="$t('recherche.Personnes')" value="personnes"></v-radio>
      <v-radio :label="$t('recherche.Importer')" value="importer"></v-radio>
    </v-radio-group>
    <résultatsRecherchePersonnes v-if="catégorie === 'personnes'" />
    <résultatsRechercheBds v-else-if="catégorie === 'bds'" />
    <résultatsRechercheImporter v-else-if="catégorie === 'importer'" />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

import Titre from "@/components/commun/Titre.vue";
import résultatsRecherchePersonnes from "@/components/recherche/résultatsRecherchePersonnes.vue";
import résultatsRechercheBds from "@/components/recherche/résultatsRechercheBds.vue";
import résultatsRechercheImporter from "@/components/commun/dialogueImporter.vue";
import mixinImage from "@/mixins/images";

export default Vue.extend({
  name: "PageRecherche",
  components: { Titre, résultatsRecherchePersonnes, résultatsRechercheBds, résultatsRechercheImporter },
  mixins: [mixinImage],
  data: function () {
    return {
      catégorie: "bds",
    };
  },
});
</script>

<style></style>
