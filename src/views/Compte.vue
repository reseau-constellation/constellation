<template>
  <v-container>
    <titre
      :entête="$t('compte.entête')"
      :image="imageProfil"
      :imageRonde="true"
    />
    <v-tabs v-model="onglet">
      <v-tab>{{ $t("compte.onglets.compte.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.thème.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.réseau.entête") }}</v-tab>
    </v-tabs>
    <v-tabs-items v-model="onglet">
      <v-tab-item>
        <paramètres />
      </v-tab-item>
      <v-tab-item>
        <thème />
      </v-tab-item>
      <v-tab-item>
        <réseau />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import titre from "@/components/commun/Titre";
import paramètres from "@/components/compte/paramètres";
import réseau from "@/components/compte/réseau";
import thème from "@/components/compte/thème";
import mixinImage from "@/mixins/images";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "Compte",
  components: { titre, réseau, thème, paramètres },
  mixins: [mixinImage, mixinIPA],
  data: function() {
    return {
      onglet: null,
      imageCompte: null
    };
  },
  computed: {
    imageProfil: function() {
      if (this.imageCompte) {
        return this.imageCompte;
      }
      const options = [this.image("profilFemme"), this.image("profilHomme")];
      // Dans le doute, on garde ça équitable :)
      return options[Math.floor(Math.random() * options.length)];
    }
  },
  methods: {
    initialiserSuivi: async function() {
      const oublierImage = await this.$ipa.compte.suivreImage(image => {
        if (image) {
          const url = URL.createObjectURL(
            new Blob([image.buffer], { type: "image/png" })
          );
          this.imageCompte = url;
        } else {
          this.imageCompte = null;
        }
      });
      this.suivre(oublierImage);
    }
  }
};
</script>

<style></style>
