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

    <v-list-item>
      <v-list-item-content>
        <v-row>
          <v-col cols="4">
            <v-select
              label="langue"
              v-model="langueNouveauNom"
              outlined
              dense
              hide-details
              offset-x
              :items="itemsLangues"
            ></v-select>
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="nouveauNom"
              label="Votre nom"
              :dir="droiteÀGauche(langueNouveauNom) ? 'rtl' : 'ltr'"
              outlined
              dense
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn
          icon
          color="success"
          :disabled="!langueNouveauNom || !nouveauNom"
          @click="ajouter(langueNouveauNom, nouveauNom)"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
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
import itemNom from "@/components/compte/boîteNoms/itemNom";

export default {
  name: "BoîteNoms",
  components: { itemNom },
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
      return this.languesNuchabal
        .filter(lng => {
          return !Object.keys(this.noms).includes(lng);
        })
        .map(code => {
          return {
            text: this.nomDeLangue(code),
            value: code
          };
        });
    }
  },
  methods: {
    ajouter(langue, nom) {
      this.$ipa.compte.sauvegarderNom(langue, nom);
      this.langueNouveauNom = this.nouveauNom = "";
    },
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
