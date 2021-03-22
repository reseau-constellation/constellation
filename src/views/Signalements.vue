<template>
  <v-container class="text-center">
    <titre
      :entête="$t('signalements.entête')"
      :image="image('problème')"
      :soustitre="$t('signalements.soustitre')"
    />
    <v-btn
      tiled outlined class="mx-2"
      @click="ouvrirNavigateur('https://github.com/julienmalard/constellation/issues')"
      append
    >
      {{ $t('signalements.bouton') }}
      <v-icon right>
        mdi-open-in-new
      </v-icon>
    </v-btn>
    <v-btn
      class="mx-2"
      tiled outlined
      href="mailto:julien.malard@mail.mcgill.ca"
      append
    >
      {{ $t('signalements.boutonCourriel') }}
      <v-icon right>
        mdi-email
      </v-icon>
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import isElectron from "is-electron";

import Titre from "@/components/commun/Titre";
import mixinImage from "@/mixins/images";

export default {
  name: "Signalements",
  components: { Titre },
  mixins: [mixinImage],
  methods: {
    ouvrirNavigateur: async function(lien: string) {
      if (isElectron()) {
        const electron = await import("electron");
        const { shell } = electron
        shell.openExternal(lien);
      } else {
        window.open(lien, '_newtab')
      }
    }
  }
};
</script>

<style></style>
