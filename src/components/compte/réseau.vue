<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.réseau.équipes") }}
        </p>
        <p class="text--disabled">
          Les fonctionnalités d'équipe seront ajoutées prochainement.
        </p>
      </v-col>
      <v-col cols="12">
        <p class="px-0 text-overline">
          {{ $t("compte.onglets.réseau.connexions") }}
        </p>
        <v-divider v-if="connexions.length" />
        <v-list v-if="connexions.length" two-line dense>
          <v-list-item v-for="c in connexions" :key="c.peer.toString()">
            <v-list-item-avatar>
              {{ c.peer.toString()[c.peer.toString().length - 1] }}
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ c.peer.toString() }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ c.addr.toString() }}
              </v-list-item-subtitle>
            </v-list-item-content>

          </v-list-item>
        </v-list>
        <p
          v-else
          class="text--disabled"
        >
          Aucune connexion pour l'instant
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import mixinIPA from "@/mixins/ipa";

export default {
  name: "ongletRéseau",
  mixins: [mixinIPA],
  data: function() {
    return {
      connexions: []
    }
  },
  methods: {
    initialiserSuivi: async function() {
      const oublierConnexions = await this.$ipa.suivreConnexionsPostes(
        connexions => {
          this.connexions = connexions;
        }
      );

      this.suivre([oublierConnexions]);
    }
  }
};
</script>

<style></style>
