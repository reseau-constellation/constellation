<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12">
        <p class="px-0 mb-0 text-overline">
          {{ $t("compte.onglets.compte.info") }}
        </p>
        <p class="py-0 text--disabled">
          <v-icon small disabled>mdi-information-outline</v-icon>
          {{ $t("compte.onglets.compte.infoPublique") }}
        </p>
        <v-row>
          <v-col cols="4">
            <v-text-field
              outlined
              dense
              hide-details
              prepend-icon="mdi-account"
              append-outer-icon="mdi-earth"
              :label="$t('compte.onglets.compte.nom')"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              outlined
              dense
              hide-details
              prepend-icon="mdi-email"
              :label="$t('compte.onglets.compte.courriel')"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-file-input
              v-model="image"
              accept="image/*"
              prepend-icon="mdi-camera-outline"
              outlined
              small-chips
              dense
              :label="$t('compte.onglets.compte.image')"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.compte.dispositifs") }}
        </p>
        <p class="text--disabled">
          Pour l'instant, l'ajout d'un nouveau dispositif électronique à votre
          compte n'est pas encore pris en charge.
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: "ongletParamètresCompte",
  data: function() {
    return {
      image: null
    };
  },
  watch: {
    image: function(fichier) {
      if (fichier) {
        return; // sauvegarder image
      } else {
        return; // effacer l'image
      }
    }
  }
};
</script>

<style></style>
