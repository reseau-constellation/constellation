<template>
  <v-list-item @click="$emit('click')">
    <avatar-profil :id="id" />
    <v-list-item-content>
      <span>
        <p class="mb-2 mx-2">{{ couper(nom, 25) }}</p>

        <v-chip
          v-if="!accepté"
          class="mx-2"
          outlined
          label
          small
          color="secondary"
          >{{ $t("itemAuteur.Invité") }}</v-chip
        >
        <v-chip v-if="mod" class="mx-2" outlined label small color="success">{{
          $t("itemAuteur.Modérateur")
        }}</v-chip>
      </span>
    </v-list-item-content>
    <v-list-item-action>
      <lien-orbite :lien="id" />
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import avatarProfil from "@/components/commun/avatarProfil.vue";
import lienOrbite from "@/components/commun/lienOrbite.vue";

import { traduireNom, couper } from "@/utils";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "itemAuteur",
  props: {
    id: String,
    mod: Boolean,
    accepté: Boolean,
  },
  mixins: [mixinLangues, mixinIPA],
  components: { avatarProfil, lienOrbite },
  data: function () {
    return {
      dialogue: false,
      nomsAuteur: {},
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.nomsAuteur).length
        ? traduireNom(this.nomsAuteur, this.languesPréférées)
        : this.id;
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.réseau!.suivreNomsMembre({
        idCompte: this.id,
        f: (noms) => {
          this.nomsAuteur = noms;
        }
      });
      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
