<template>
  <v-list-item>
    <avatar-profil :id="id" />
    <v-list-item-content>
      <span>
        <p class="mb-2 mx-2">{{ couper(nom, 25) }}</p>
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
  name: "itemMembre",
  props: ["id"],
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
        },
      });
      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
