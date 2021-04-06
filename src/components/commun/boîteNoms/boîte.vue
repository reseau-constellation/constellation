<template>
  <v-card max-width="500">
    <v-card-title>
      Internationalisez votre nom !
    </v-card-title>
    <v-card-subtitle>
      Le plus de langues vous ajouterez, le plus de chances que les autres
      membres de Constellation sauront comment vous appeler.
    </v-card-subtitle>
    <v-divider></v-divider>
    <item-nouveau-nom
      :languesExistantes="Object.keys(this.noms)"
      etiquetteLangue="Langue"
      etiquetteNom="Votre nom"
      @sauvegarder="sauvegarder"
    />
    <v-divider />
    <v-list style="max-height: 300px" class="overflow-y-auto">
      <item-nom
        v-for="(nom, langue) in noms"
        :key="langue"
        :nomOriginal="nom"
        :langueOriginale="langue"
        @sauvegarder="sauvegarder"
        @effacer="effacer"
        @changerLangue="changerLangue"
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
  props: ["noms"],
  mixins: [mixinLangues],
  data: function() {
    return {
      langueNouveauNom: "",
      nouveauNom: ""
    };
  },
  computed: {
    itemsLangues: function() {
      console.log(this.langues)
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
  },
  methods: {
    sauvegarder(langue, nom) {
      this.$ipa.compte.sauvegarderNom(langue, nom);
    },
    changerLangue(langue, nouvelleLangue, nom) {
      this.$ipa.compte.effacerNom(langue);
      this.$ipa.compte.sauvegarderNom(nouvelleLangue, nom);
    },
    effacer(langue) {
      this.$ipa.compte.effacerNom(langue);
    }
  }
};
</script>

<style></style>
