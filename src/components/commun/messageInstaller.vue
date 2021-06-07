<template>
  <v-snackbar v-model="visible" outlined color="warning">
    <p>{{ $t("communs.messageInstaller") }}</p>
    <v-btn
      color="warning"
      tiled
      outlined
      small
      class="mb-5"
      @click="$router.push(encodeURI('/téléchargements'))"
    >
      {{ $t("communs.btnInstaller") }}
      <v-icon right>
        mdi-download
      </v-icon>
    </v-btn>

    <template v-slot:action="{ attrs }">
      <v-btn icon v-bind="attrs" @click="visible = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import isElectron from "is-electron";
import { ouvrirLien } from "@/utils";

export default {
  name: "messageInstaller",
  data: function () {
    return {
      visible: !isElectron(),
    };
  },
  methods: { ouvrirLien },
};
</script>

<style></style>
