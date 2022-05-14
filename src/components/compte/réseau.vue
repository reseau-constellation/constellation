<template>
  <v-card class="pa-5">
    <p class="px-0 mb-0 text-overline">
      {{ $t("compte.onglets.réseau.connexions") }}
    </p>
    <v-divider v-if="connexions.length" />
    <v-list v-if="connexions.length" two-line dense>
      <v-list-item v-for="c in connexions" :key="c.addr">
        <v-list-item-avatar>
          {{ c.peer[c.peer.length - 1] }}
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ c.peer }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ c.addr }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <p v-else class="text--disabled">
      {{ $t("compte.onglets.réseau.Aucune_connexion") }}
    </p>
  </v-card>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA).extend({
  name: "ongletRéseau",
  mixins: [mixinIPA],
  data: function () {
    return {
      connexions: [] as { addr: string; peer: string }[],
    };
  },
  methods: {
    initialiserSuivi: async function () {
      const oublierConnexions =
        await this.$ipa.réseau!.suivreConnexionsPostesSFIP({
          f: (connexions) => {
            this.connexions = connexions;
          },
        });

      this.suivre([oublierConnexions]);
    },
  },
});
</script>

<style></style>
