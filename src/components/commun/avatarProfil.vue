<template>
  <v-badge
    :value="vuIlyA !== undefined"
    bottom
    dot
    overlap
    :color="
      vuIlyA ? (vuIlyA <= 1000 * 60 * 3 ? 'success' : 'warning') : 'error'
    "
    offset-x="25"
    offset-y="17"
  >
    <v-list-item-avatar class="ms-0">
      <img :src="imageProfil" />
    </v-list-item-avatar>
  </v-badge>
</template>

<script>
import mixinIPA from "@/mixins/ipa";
import mixinImage from "@/mixins/images";

export default {
  name: "avatarProfil",
  props: ["id", "vuIlyA"],
  mixins: [mixinIPA, mixinImage],
  data: function () {
    return {
      imageCompte: null
    };
  },
  computed: {
    imageProfil: function () {
      if (this.imageCompte) {
        return this.imageCompte;
      }
      const options = [this.image("profilFemme"), this.image("profilHomme")];
      // Dans le doute, on garde ça équitable :)
      return options[Math.floor(Math.random() * options.length)];
    },
  },
  watch: {
    id: async function () {
      await this.réInitialiserSuivi();
    },
  },
  methods: {
    initialiserSuivi: async function () {
      this.imageCompte = null;

      const oublierImage = await this.$ipa.réseau.suivreImageMembre(
        this.id,
        (image) => {
          if (image) {
            const url = URL.createObjectURL(
              new Blob([image.buffer], { type: "image/png" })
            );
            this.imageCompte = url;
          } else {
            this.imageCompte = null;
          }
        }
      );
      this.suivre([oublierImage]);
    },
  },
};
</script>

<style></style>
