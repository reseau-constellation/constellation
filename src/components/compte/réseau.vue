<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.réseau.équipes") }}
        </p>
        <p class="text--disabled">
          Les fonctionnalités d'équipe seront ajoutées prochainement.
        </p>
      </v-col>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.réseau.connexions") }}
        </p>
        <p class="text--disabled">Aucune connexion pour l'instant</p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: "ongletRéseau"
};
</script>

<style></style>
