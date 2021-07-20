<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline mb-2"> Réplications </v-card-title>
      <v-card-subtitle>
        Chaque réplication de la base de données contribue à sa disponibilité au
        sein du réseau Constellation.
        {{replications}}
      </v-card-subtitle>
      <v-divider />

      <v-card-text>
        <div class="mt-3">
          <v-skeleton-loader v-if="!replications" type="paragraph@2" />
          <div v-else>
            <p class="mb-0 text-overline">Présentement répliquée par</p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ replications.length }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Membres
                  <v-icon right>mdi-account</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle class="success--text"
                  >Dont {{ nMembresEnLigne }} en
                  ligne</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>

            <p class="mb-0 text-overline">Représentant</p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ nDispositifsEnLigne }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Dispositifs en ligne
                </v-list-item-title>
                <v-list-item-subtitle class="success--text"
                  ><v-icon>mdi-monitor-cellphone</v-icon></v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </div>
        </div>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "dialogueRéplications",
  props: {
    replications: {},
  },
  data: function () {
    return {
      dialogue: false,
    };
  },
  computed: {
    nMembresEnLigne: function () {
      return this.replications.filter(r => r.nDispositifsEnLigne > 0).length
    },
    nDispositifsEnLigne: function () {
      return this.replications.map(r => r.nDispositifsEnLigne).reduce((a, b) => a + b, 0)
    }
  },
  methods: {
    réplicationsMembres: function (enLigne = true) {
      const répsMembresUniques = [];
      const déjàVues = [];
      this.replications.forEach((r) => {
        const existant = répsMembresUniques.find(
          (x) => x.idOrbite === r.idOrbite
        );
        if (existant) {
          // Un membre est en ligne si au moins 1 de ses dispositifs est présentement en ligne
          existant.enLigne = existant.enLigne || r.enLigne;
        } else {
          répsMembresUniques.push(Object.assign({}, r)); //Copie de r pour permettre les modifications
          déjàVues.push(r.idOrbite);
        }
      });
      return répsMembresUniques.filter((r) => (enLigne ? r.enLigne : true));
    },
  },
};
</script>

<style></style>
