<template>
  <v-container>
    <titre :entête="$t('compte.entête')" :image="imageProfil" />
    <v-tabs v-model="onglet">
      <v-tab>{{ $t("compte.onglets.compte.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.thème.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.réseau.entête") }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="onglet">
      <v-tab-item>
        <paramètres />
      </v-tab-item>
      <v-tab-item>
        <thème />
      </v-tab-item>
      <v-tab-item>
        <réseau />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import titre from "@/components/commun/Titre";
import paramètres from "@/components/compte/paramètres";
import réseau from "@/components/compte/réseau";
import thème from "@/components/compte/thème";

export default {
  name: "Compte",
  components: { titre, réseau, thème, paramètres },
  data: function() {
    return {
      onglet: null,
    };
  },
  computed: {
    imageProfil: function() {
      const options = [
        require("@/assets/undraw/undraw_female_avatar_w3jk.svg"),
        require("@/assets/undraw/undraw_male_avatar_323b.svg")
      ];
      // Dans le doute, on garde ça équitable :)
      return options[Math.floor(Math.random() * options.length)];
    }
  }
};
</script>

<style></style>
