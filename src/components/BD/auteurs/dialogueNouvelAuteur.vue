<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-2">
        Autoriser un nouvel auteur
      </v-card-title>
      <v-card-subtitle
        ><v-icon small left>mdi-information-outline</v-icon>Attention ! Il n'est
        présentement pas possible de révoquer l'accès une fois celui-ci est
        octroyé.</v-card-subtitle
      >
      <v-divider />

      <v-card-text class="mt-3">
        <v-select
          v-model="auteurSélectionné"
          outlined
          :loading="membres === null"
          :items="listeMembres"
          hide-details
        >
          <template v-slot:item="{ item, on, attrs }">
            <item-membre v-bind="attrs" v-on="on" :id="item.idBdRacine" />
          </template>
          <template v-slot:selection="{ item }">
            <jeton-membre :id="item.idBdRacine" />
          </template>
        </v-select>
        <v-checkbox
          v-model="donnerPermissionModérateur"
          :disabled="!auteurSélectionné"
          label="Donner permission modérateur"
        />
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="annuler">
          {{ $t("communs.annuler") }}
        </v-btn>
        <v-btn
          color="primary"
          text
          outlined
          :loading="enProgrès"
          :disabled="!auteurSélectionné"
          @click="confirmer"
        >
          {{ $t("communs.confirmer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import jetonMembre from "@/components/commun/jetonMembre.vue";
import itemMembre from "@/components/commun/itemMembre.vue";

import mixinIPA from "@/mixins/ipa";

import { MODÉRATEUR, MEMBRE } from "@/ipa/accès/consts";
import { infoMembreEnLigne } from "@/ipa/reseau";

interface Membre extends infoMembreEnLigne {
  value: string;
}

export default mixins(mixinIPA).extend({
  name: "dialogueNouvelAuteur",
  props: ["auteurs", "idBd", "permissionModifier"],
  mixins: [mixinIPA],
  components: { jetonMembre, itemMembre },
  data: function () {
    return {
      dialogue: false,
      enProgrès: false,
      membres: null as null | infoMembreEnLigne[],
      auteurSélectionné: null as null | string,
      donnerPermissionModérateur: false,

      enCours: false,
    };
  },
  computed: {
    listeMembres: function (): Membre[] {
      return this.membres
        ? this.membres.map((m: infoMembreEnLigne) => {
            return { ...m, value: m.idBdRacine };
          })
        : [];
    },
  },
  methods: {
    annuler: function (): void {
      this.auteurSélectionné = null;
      this.donnerPermissionModérateur = false;
      this.dialogue = false;
    },
    confirmer: async function (): Promise<void> {
      if (!this.auteurSélectionné) return;

      this.enCours = true;
      await this.$ipa.bds!.inviterAuteur(
        this.idBd,
        this.auteurSélectionné,
        this.donnerPermissionModérateur ? MODÉRATEUR : MEMBRE
      );
      this.enCours = false;
      this.annuler();
    },
    initialiserSuivi: async function () {
      const oublierMembres = await this.$ipa.réseau!.suivreMembres(
        (membres) => {
          this.membres = membres;
        }
      );

      this.suivre([oublierMembres]);
    },
  },
});
</script>

<style></style>
