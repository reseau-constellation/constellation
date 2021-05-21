<template>
  <v-col cols="12">
    <v-slide-x-transition group class="d-flex flex-wrap justify-center">
      <carte-membre v-for="{ id } in membres" :key="id" :id="id" />
    </v-slide-x-transition>
  </v-col>
</template>

<script>
import mixinIPA from "@/mixins/ipa";
import carteMembre from "@/components/commun/carteMembre";

export default {
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteMembre },
  data: function () {
    return {
      membres: [],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierMembres = await this.$ipa.réseau.suivreMembres((membres) => {
        this.membres = membres;
      });

      this.suivre([oublierMembres]);
    },
  },
};
</script>

<style></style>
