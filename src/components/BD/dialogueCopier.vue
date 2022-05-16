<template>
  <v-dialog v-model="dialogue" scrollable max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-3">
        {{ $t("bd.copierBd.titre") }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="mt-3 py-2">
        <v-checkbox
          v-model="inclureDonnées"
          :label="$t('bd.copierBd.inclureDonnées')"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
        <v-btn
          color="primary"
          text
          outlined
          :loading="enProgrès"
          @click="() => copier()"
        >
          {{ $t("bd.copierBd.copier") }}
          <v-icon right>mdi-card-multiple-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { BookType } from "xlsx";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "dialogueCopierBd",
  props: ["id"],
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,

      inclureDonnées: true,
    };
  },
  methods: {
    copier: async function () {
      this.enProgrès = true;

      const nouvelId = await this.$ipa.bds!.copierBd({
        id: this.id,
        ajouterÀMesBds: true,
        copierDonnées: this.inclureDonnées,
      });
      this.$router.push(`/bd/visualiser/${encodeURIComponent(nouvelId)}`);

      this.dialogue = false;
      this.enProgrès = false;
    },
  },
});
</script>

<style></style>
