<template>
  <v-container>
    <titre :entête="$t('compte.entête')" :imageRonde="true" />
    <imageÉditable
      :srcImage="imageProfil"
      :MAX_TAILLE_IMAGE="MAX_TAILLE_IMAGE"
      @imageChoisie="imageChoisie"
      @effacerImage="effacerImageProfil"
    />

    <v-tabs v-model="onglet">
      <v-tab>{{ $t("compte.onglets.compte.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.thème.entête") }}</v-tab>
      <v-tab>{{ $t("compte.onglets.réseau.entête") }}</v-tab>
      <v-spacer />
      <v-switch v-model="serveur" v-if="électron" dense inset>
        <template v-slot:label>
          <v-icon> {{ serveur ? "mdi-server" : "mdi-server-off" }} </v-icon>
        </template>
      </v-switch>
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

<script lang="ts">
import oùSommesNous from "wherearewe";
import mixins from "vue-typed-mixins";

import titre from "@/components/commun/Titre.vue";
import paramètres from "@/components/compte/paramètres.vue";
import réseau from "@/components/compte/réseau.vue";
import thème from "@/components/compte/thème.vue";
import imageÉditable from "@/components/commun/imageÉditable.vue";

import mixinImage from "@/mixins/images";
import mixinIPA from "@/mixins/ipa";

import { profil } from "@constl/ipa";

const { MAX_TAILLE_IMAGE } = profil;

export default mixins(mixinImage, mixinIPA).extend({
  name: "PageCompte",
  components: {
    titre,
    réseau,
    thème,
    paramètres,
    imageÉditable,
  },
  mixins: [mixinImage, mixinIPA],
  data: function () {
    return {
      onglet: null,
      imageCompte: null as null | string,
      serveur: false,
      électron: oùSommesNous.isElectron,
      MAX_TAILLE_IMAGE,
    };
  },
  computed: {
    imageProfil: function (): string {
      if (this.imageCompte) {
        return this.imageCompte;
      }
      const options = [this.image("profilFemme"), this.image("profilHomme")];
      // Dans le doute, on garde ça équitable :)
      return options[Math.floor(Math.random() * options.length)];
    },
  },
  watch: {
    serveur: function (val) {
      window.ipa.send("àPrincipal:serveur", { type: "activer" });
    },
  },
  methods: {
    effacerImageProfil: async function () {
      await this.$ipa.profil!.effacerImage();
    },
    imageChoisie: async function ({
      données,
    }: {
      données: Uint8Array;
    }): Promise<void> {
      await this.$ipa.profil!.sauvegarderImage({ image: données });
    },
    initialiserSuivi: async function () {
      const oublierImage = await this.$ipa.profil!.suivreImage({
        f: (image) => {
          if (image) {
            const url = URL.createObjectURL(
              new Blob([image.buffer], { type: "image/png" })
            );
            this.imageCompte = url;
          } else {
            this.imageCompte = null;
          }
        },
      });
      this.suivre(oublierImage);
    },
  },
});
</script>

<style scoped>
.fond {
  transition: opacity 0.4s ease-in-out;
}

.fond:not(.on-hover) {
  opacity: 0;
}

.fond.on-hover {
  opacity: 0.5;
}

.show-btns {
  color: rgba(255, 255, 255, 1) !important;
}
</style>
