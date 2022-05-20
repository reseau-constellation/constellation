<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-2">
        {{ $t("dialogueNouvelAuteur.புதிய_அங்கீகாரம்") }}
      </v-card-title>
      <v-card-subtitle
        ><v-icon small left>mdi-information-outline</v-icon>
        {{ $t("dialogueNouvelAuteur.எச்சரிக்கை") }}
      </v-card-subtitle>
      <v-divider />

      <v-card-text class="mt-3">
        <v-select
          v-model="auteursSélectionnés"
          outlined
          multiple
          :loading="membresRéseau === null"
          :items="listeMembres"
          hide-details
        >
          <template v-slot:item="{ item, on, attrs }">
            <item-membre v-bind="attrs" v-on="on" :id="item.value" />
          </template>
          <template v-slot:selection="{ item }">
            <jeton-membre :id="item.value" />
          </template>
        </v-select>
        <v-checkbox
          v-model="donnerPermissionModérateur"
          :disabled="!auteursSélectionnés.length"
          :label="$t('dialogueNouvelAuteur.அனுமதி_கொடுங்கள்')"
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
          :disabled="!auteursSélectionnés.length"
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

import { accès } from "@constl/ipa";

const { MODÉRATEUR, MEMBRE } = accès;

interface Membre {
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
      membresRéseau: null as null | string[],
      auteursSélectionnés: [] as string[],
      donnerPermissionModérateur: false,

      enCours: false,
    };
  },
  computed: {
    listeMembres: function (): Membre[] {
      return this.membresRéseau
        ? this.membresRéseau.map((m: string) => {
            return { value: m };
          })
        : [];
    },
  },
  methods: {
    annuler: function (): void {
      this.auteursSélectionnés = [];
      this.donnerPermissionModérateur = false;
      this.dialogue = false;
    },
    confirmer: async function (): Promise<void> {
      if (!this.auteursSélectionnés.length) return;

      this.enCours = true;
      for (const auteur of this.auteursSélectionnés) {
        await this.$ipa.bds!.inviterAuteur({
          idBd: this.idBd,
          idBdCompteAuteur: auteur,
          rôle: this.donnerPermissionModérateur ? MODÉRATEUR : MEMBRE,
        });
      }

      this.enCours = false;
      this.annuler();
    },
    initialiserSuivi: async function () {
      const { fOublier: oublierMembres } =
        await this.$ipa.réseau!.rechercherMembres({
          f: (membres) => {
            this.membresRéseau = membres.map((m) => m.id).filter((c) => c);
          },
          nRésultatsDésirés: 10,
        });

      this.suivre([oublierMembres]);
    },
  },
});
</script>

<style></style>
