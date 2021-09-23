<template>
  <v-snackbar
    v-model="active"
    :multi-line="multiLine"

    color="error"
    outlined
  >
      Oups ! Nous avons une erreur.

      <template v-slot:action="{ attrs }">
        <v-btn
          color="red"
          text
          v-bind="attrs"
          @click="active = false"
        >
          {{ $t("communs.fermer") }}
        </v-btn>
      </template>
    </v-snackbar>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

export default mixins().extend({
  name: "alerteErreurConstellation",
  data: function () {
    return {
      active: false,
      nouvelleErreur: undefined as Error | undefined,
      toutesLesErreur: [] as Error[],
      fOublierErreurs: undefined as undefined | (() => void)
    };
  },

  methods: {
    initialiserSuivi: async function () {

      const fSuivreErreurs = (erreurs: { nouvelle: Error, toutes: Error[]}) => {
        this.active = true;

        const { nouvelle, toutes } = erreurs
        this.nouvelleErreur = nouvelle;
        this.toutesLesErreur = toutes;
      }

      this.$ipa.événements.on(
        "erreur", fSuivreErreurs
      )

      this.fOublierErreurs = () => this.$ipa.événements.off(
        "erreur", fSuivreErreurs
      )
    },
  },
  destroyed: function () {
    if (this.fOublierErreurs) this.fOublierErreurs();
  }
});
</script>

<style>

</style>
