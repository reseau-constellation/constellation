<template>
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
          <v-img :src="srcImage" contain>
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
                      @click="effacerImage"
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
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinImage from "@/mixins/images";

export default mixins(mixinImage).extend({
  name: "ImageÉditable",
  mixins: [mixinImage],
  props: ["srcImage", "MAX_TAILLE_IMAGE"],
  data: function () {
    return {
      fichierTropGrand: false,
    };
  },
  methods: {
    choisirImage: async function () {
      const choixFichier = this.$refs.choixFichier as HTMLInputElement
      choixFichier.click();
    },
    effacerImage: async function () {
      await this.$emit("effacerImage");
    },
    imageChoisie: async function(): Promise<void> {
      const choixFichier = this.$refs.choixFichier as HTMLInputElement;
      if (!choixFichier.files?.length) return

      const fichier = choixFichier.files[0];
      if (fichier.size > this.MAX_TAILLE_IMAGE) {
        this.fichierTropGrand = true;
        return
      } else {
        this.fichierTropGrand = false;
      }

      const données = await fichier.arrayBuffer();
      await this.$emit("imageChoisie", { données });
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
