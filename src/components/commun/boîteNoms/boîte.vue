<template>
  <v-dialog v-model="dialogue" max-width="900">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title>
        {{ $t(titre) }}
        <v-spacer />
        <v-btn icon @click="dialogue = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        {{ $t(sousTitre) }}
      </v-card-subtitle>
      <v-divider></v-divider>
      <item-nouveau-nom
        :languesExistantes="Object.keys(this.noms)"
        :etiquetteLangue="etiquetteLangue"
        :etiquetteNom="etiquetteNom"
        @sauvegarder="(e) => $emit('sauvegarder', e)"
      />
      <v-divider />
      <v-list style="max-height: 300px" class="overflow-y-auto">
        <item-nom
          v-for="(nom, langue) in noms"
          :key="langue"
          :nomOriginal="nom"
          :langueOriginaleNom="langue"
          @sauvegarder="(e) => $emit('sauvegarder', e)"
          @effacer="(e) => $emit('effacer', e)"
          @changerLangue="(e) => $emit('changerLangue', e)"
        />
        <div v-if="!Object.keys(noms).length" class="text-center">
          <p class="text-h5 mt-5">
            {{ $t(etiquetteAucunNom) }}
          </p>
          <v-img :src="image('vide')" class="my-5" contain height="175px" />
        </div>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";
import mixinImages from "@/mixins/images";
import itemNom from "./itemNom.vue";
import itemNouveauNom from "./itemNouveauNom.vue";

export default mixins(mixinLangues, mixinImages).extend({
  name: "DialogueNoms",
  components: { itemNom, itemNouveauNom },
  props: {
    noms: Object,
    titre: {
      type: String,
      default: "boîteNoms.titre",
    },
    sousTitre: {
      type: String,
      default: "boîteNoms.sousTitre",
    },
    etiquetteNom: {
      type: String,
      default: "boîteNoms.étiquetteNom",
    },
    etiquetteLangue: {
      type: String,
      default: "boîteNoms.étiquetteLangue",
    },
    etiquetteAucunNom: {
      type: String,
      default: "boîteNoms.étiquetteAucunNom",
    },
  },
  mixins: [mixinLangues],
  data: function () {
    return {
      dialogue: false,
    };
  },
  computed: {
    itemsLangues: function (): { text: string; value: string }[] {
      return this.langues
        .filter((lng) => {
          return !Object.keys(this.noms).includes(lng);
        })
        .map((code) => {
          return {
            text: this.nomDeLangue(code) || code,
            value: code,
          };
        });
    },
  },
});
</script>

<style></style>
