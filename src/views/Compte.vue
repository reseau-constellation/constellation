<template>
  <v-container>
    <titre
      :entête="$t('compte.entête')"
      :imageRonde="true"
    />

    <v-row class="mt-3 text-center">
      <input
        type="file"
        style="display: none"
        ref="choixFichier"
        accept="image/*"
        @change="imageChoisie"
      />
      <v-snackbar
        v-model="fichierTropGrand"
        timeout="5000"
        color="error"
        outlined
      >
        {{ $t('compte.onglets.compte.பட_அளவு') }}

        <template v-slot:action="{ attrs }">
          <v-btn
            icon
            v-bind="attrs"
            @click="fichierTropGrand = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
      <v-col cols="12">
        <v-hover v-slot="{ hover }">
          <v-avatar
            size="175"
            :elevation="hover ? 12 : 2"
            class="mb-3"
          >
            <v-img :src="imageProfil">
              <v-row
                :class="{
                  'on-hover': hover,
                  'align-self-center': true,
                  'fill-height': true,
                  'flex-column': true,
                  'fond': true
                }"
                style="background-color: black"
              >
                <div class="align-self-center" style="height: 100%;">
                  <v-row
                    class="flex-column fill-height ma-0"
                  >
                    <div class="my-auto">
                      <v-btn
                        :class="{ 'show-btns': hover  }"
                        color="rgba(255, 255, 255, 0)"
                        class="align-self-center"
                        icon
                        large
                        @click="choisirImage"
                      >
                        <v-icon
                          :class="{ 'show-btns': hover, 'mx-4': true }"
                          color="rgba(255, 255, 255, 0)"
                          large
                        >
                          mdi-camera-outline
                        </v-icon>
                      </v-btn>
                      <v-btn
                        :class="{ 'show-btns': hover  }"
                        color="rgba(255, 255, 255, 0)"
                        class="align-self-center"
                        icon
                        large
                        @click="effacerImageProfil"
                      >
                        <v-icon
                          :class="{ 'show-btns': hover, 'mx-4': true }"
                          color="rgba(255, 255, 255, 0)"
                          large
                        >
                          mdi-close
                        </v-icon>
                      </v-btn>
                    </div>
                  </v-row>
                </div>
              </v-row>
            </v-img>
          </v-avatar>
        </v-hover>

      </v-col>
    </v-row>

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
  },
  mixins: [mixinImage, mixinIPA],
  data: function () {
    return {
      onglet: null,
      imageCompte: null as null | string,
      fichierTropGrand: false,
      serveur: false,
      électron: oùSommesNous.isElectron,
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
    choisirImage: async function () {
      const choixFichier = this.$refs.choixFichier as HTMLInputElement
      choixFichier.click();
    },
    effacerImageProfil: async function () {
      await this.$ipa.profil!.effacerImage();
    },
    imageChoisie: async function(): Promise<void> {
      const choixFichier = this.$refs.choixFichier as HTMLInputElement;
      if (!choixFichier.files?.length) return

      const fichier = choixFichier.files[0];
      if (fichier.size > MAX_TAILLE_IMAGE) {
        this.fichierTropGrand = true;
        return
      } else {
        this.fichierTropGrand = false;
      }

      const données = await fichier.arrayBuffer();
      await this.$ipa.profil!.sauvegarderImage(données);
      },
    initialiserSuivi: async function () {
      const oublierImage = await this.$ipa.profil!.suivreImage((image) => {
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
    },
  },
});
</script>

<style scoped>
.fond {
  transition: opacity .4s ease-in-out;
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
