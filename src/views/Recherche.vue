<template>
  <v-container class="text-center justify-center">
    <titre
      :entête="$t('recherche.entête')"
      :image="image('recherche')"
      :soustitre="$t('recherche.soustitre')"
    />
    <v-text-field outlined class="mx-10 mt-0"></v-text-field>
    <v-radio-group
      v-model="catégorie"
      row
    >
      <v-radio
        label="Personnes"
        value="personnes"
      ></v-radio>
      <v-radio
        label="Bases de données"
        value="bds"
      ></v-radio>
    </v-radio-group>
    <résultatsRecherchePersonnes v-if="catégorie === 'personnes'" />
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import résultatsRecherchePersonnes from "@/components/recherche/résultatsRecherchePersonnes";
import mixinImage from "@/mixins/images";

export default {
  name: "Recherche",
  components: { Titre, résultatsRecherchePersonnes },
  mixins: [mixinImage],
  data: function() {
    return {
      catégorie: "personnes"
    }
  }
};
</script>

<style></style>
