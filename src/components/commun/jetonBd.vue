<template>
  <v-chip
    class="me-1 mb-1"
    label
    outlined
    small
    @click="$router.push(`/bd/visualiser/${encodeURIComponent(id)}`)"
  >
    <v-icon left small>mdi-database-outline</v-icon>
    <texteTronqué :texte="nom" :longueurMax="15" />
  </v-chip>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import texteTronqué from "@/components/commun/texteTronqué.vue";

import { traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues, mixinIPA).extend({
  name: "jetonBd",
  props: ["id"],
  mixins: [mixinLangues, mixinIPA],
  components: { texteTronqué },
  data: function () {
    return {
      noms: {},
      catégorie: undefined,
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id;
    },
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.bds!.suivreNomsBd({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
