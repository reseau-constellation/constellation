<template>
  <v-chip class="me-1 mb-1" label outlined>
    <avatar-profil :id="id" />
    {{ couper(nom, 25) }}
    <lien-orbite :lien="id" />
  </v-chip>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import lienOrbite from "@/components/commun/lienOrbite.vue";
import avatarProfil from "@/components/commun/avatarProfil.vue";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "jetonMembre",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { avatarProfil, lienOrbite },
  data: function () {
    return {
      noms: {},
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
  },
  watch: {
    id: async function () {
      await this.réInitialiserSuivi();
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      this.noms = {};
      const oublierNoms = await this.$ipa.réseau!.suivreNomsMembre(
        this.id,
        (noms) => {
          this.noms = noms;
        }
      );
      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
