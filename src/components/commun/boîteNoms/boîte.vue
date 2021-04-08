<template>
  <v-card max-width="500">
    <v-card-title>
      {{ $t(titre) }}
    </v-card-title>
    <v-card-subtitle>
      {{ $t(sousTitre) }}
    </v-card-subtitle>
    <v-divider></v-divider>
    <item-nouveau-nom
      :languesExistantes="Object.keys(this.noms)"
      :etiquetteLangue="$t(etiquetteLangue)"
      :etiquetteNom="$t(etiquetteNom)"
      @sauvegarder="e => $emit('sauvegarder', e)"
    />
    <v-divider />
    <v-list style="max-height: 300px" class="overflow-y-auto">
      <item-nom
        v-for="(nom, langue) in noms"
        :key="langue"
        :nomOriginal="nom"
        :langueOriginale="langue"
        @sauvegarder="e => $emit('sauvegarder', e)"
        @effacer="e => $emit('effacer', e)"
        @changerLangue="e => $emit('changerLangue', e)"
      />
    </v-list>
  </v-card>
</template>

<script>
import mixinLangues from "@/mixins/langues";
import itemNom from "./itemNom";
import itemNouveauNom from "./itemNouveauNom";

export default {
  name: "BoîteNoms",
  components: { itemNom, itemNouveauNom },
  props: {
    noms: Object,
    titre: {
      type: String,
      default: "boîteNoms.titre"
    },
    sousTitre: {
      type: String,
      default: "boîteNoms.sousTitre"
    },
    etiquetteNom: {
      type: String,
      default: "boîteNoms.étiquetteNom"
    },
    etiquetteLangue: {
      type: String,
      default: "boîteNoms.étiquetteLangue"
    }
  },
  mixins: [mixinLangues],
  data: function() {
    return {
      langueNouveauNom: "",
      nouveauNom: ""
    };
  },
  mounted: function() {
    console.log(Object.keys(this.noms)[-1]);
  },
  computed: {
    itemsLangues: function() {
      return this.langues
        .filter(lng => {
          return !Object.keys(this.noms).includes(lng);
        })
        .map(code => {
          return {
            text: this.nomDeLangue(code) || code,
            value: code
          };
        });
    }
  }
};
</script>

<style></style>
