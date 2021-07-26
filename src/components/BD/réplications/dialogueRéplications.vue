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
      </v-card-subtitle>
      <v-divider />

      <v-card-text>
        <div class="mt-3">
          <v-skeleton-loader v-if="!replications" type="paragraph@2" />
          <div v-else>
            <p class="mb-0 text-overline">Présentement répliquée par</p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ dispositifs.length }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  Dispositifs
                  <v-icon right>mdi-monitor-cellphone</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle class="success--text"
                  >Dont {{ dispositifsEnLigne.length }} en
                  ligne</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>

            <p class="mb-0 text-overline">Représentant</p>
            <v-list-item two-line>
              <v-avatar class="me-3 text-h3">
                {{ membres.length }}
              </v-avatar>
              <v-list-item-content>
                <v-list-item-title
                  >Membres<v-icon right>mdi-account</v-icon></v-list-item-title
                >
                <v-list-item-subtitle class="success--text"
                  >Dont {{ membresEnLigne.length }} en
                  ligne</v-list-item-subtitle
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
const DÉLAI_EN_LIGNE = 10000;

export default {
  name: "dialogueRéplications",
  props: {
    replications: {},
  },
  data: function () {
    return {
      dialogue: false,
      maintenant: new Date().getTime(),
    };
  },
  computed: {
    dispositifs: function () {
      return this.replications || [];
    },
    dispositifsEnLigne: function () {
      return this.dispositifs.filter(
        (d) => this.maintenant - d.vuÀ <= DÉLAI_EN_LIGNE
      );
    },
    membres: function () {
      const répsMembresUniques = [];
      const déjàVues = [];
      this.dispositifs.forEach((r) => {
        const existant = répsMembresUniques.find(
          (x) => x.idOrbite === r.idOrbite
        );
        if (!existant || r.vuÀ < existant.vuÀ) {
          répsMembresUniques.push(Object.assign({}, r)); //Copie de r pour permettre les modifications
          if (existant) existant.vuÀ = r.vuÀ;
          else déjàVues.push(r.idOrbite);
        }
      });
      return répsMembresUniques;
    },
    membresEnLigne: function () {
      return this.membres.filter(
        (m) => this.maintenant - m.vuÀ <= DÉLAI_EN_LIGNE
      );
    },
  },
  mounted: function () {
    setInterval(() => {
      this.maintenant = new Date().getTime();
    }, 1000);
  },
};
</script>

<style></style>
