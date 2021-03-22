<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12">
        <p class="px-0 text-overline">{{ $t('compte.onglets.compte.info') }}</p>
        <v-row>
          <v-col cols="4">
            <v-text-field outlined dense prepend-icon="mdi-account" append-outer-icon="mdi-earth" />
          </v-col>
          <v-col cols="4">
            <v-text-field outlined dense prepend-icon="mdi-email" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <p class="px-0 text-overline">{{ $t('compte.onglets.compte.dispositifs') }}</p>
        <p class="text--disabled"> Pour l'instant, l'ajout d'un nouveau dispositif électronique à votre compte
          n'est pas encore pris en charge. </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  name: "ongletParamètresCompte"
}
</script>

<style>

</style>
