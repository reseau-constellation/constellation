<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-content>
      {{ couper(nom, 25) }}
      <div>
        <jeton-variable v-for="m in variables" :key="m" :id="m" />
      </div>
    </v-list-item-content>
    <v-list-item-action>
      <v-dialog v-if="permissionÉcrire" v-model="dialogue" width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" icon color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline red--text">
            Voulez-vous vraiment effacer ce tableau ?
          </v-card-title>

          <v-card-text>
            Ceci enlevera le tableau de votre dispositif. Elle n'effacera pas
            des copies que d'autres utilisatrices et utilisateurs de
            Constellation pourraient avoir créées.
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text outlined @click="dialogue = false">
              Non !
            </v-btn>
            <v-btn color="error" depressed @click="effacerTableau">
              Oui, effacer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { traduireNom, couper } from "@/utils";
import jetonVariable from "@/components/commun/jetonVariable";
import mixinLangues from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default {
  name: "itemTableau",
  props: ["id", "idBD"],
  components: { jetonVariable },
  mixins: [mixinLangues, mixinIPA],
  data: function() {
    return {
      permissionÉcrire: false,
      dialogue: false,
      nomsTableau: {},
      variables: []
    };
  },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    idTableau: function() {
      return decodeURIComponent(this.id);
    },
    nom: function() {
      return Object.keys(this.nomsTableau).length
        ? traduireNom(this.nomsTableau, this.langues)
        : this.idTableau;
    }
  },
  methods: {
    couper,
    effacerTableau: async function() {
      await this.$ipa.bds.effacerTableauBD(this.idBD, this.idTableau);
    },
    initialiserSuivi: async function() {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.idTableau);
      const oublierNoms = await this.$ipa.tableaux.suivreNomsTableau(
        this.idTableau,
        noms => {
          this.nomsTableau = noms;
        }
      );
      this.suivre([oublierNoms]);
    }
  }
};
</script>

<style></style>
