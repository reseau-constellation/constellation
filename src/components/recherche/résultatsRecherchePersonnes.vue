<template>
  <span>
    <carte-membre v-for="{id} in membres" :key="id" :id="id">
    </carte-membre>
  </span>
</template>

<script>
import mixinIPA from "@/mixins/ipa";
import carteMembre from "@/components/commun/carteMembre";

export default {
  name: "résultatsRecherchePersonnes",
  mixins: [mixinIPA],
  components: { carteMembre },
  data: function() {
    return {
      membres: [],
      catégorie: "personnes"
    }
  },
  methods: {
    initialiserSuivi:  async function() {
      const oublierMembres = await this.$ipa.réseau.suivreMembres(
        membres => {
          this.membres = membres;
        }
      );

      this.suivre([oublierMembres]);
    }
  }
}
</script>

<style>

</style>
