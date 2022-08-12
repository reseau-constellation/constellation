<template>
  <v-card class="pa-5">
    <p class="px-0 mb-0 text-overline">
      {{ $t("compte.onglets.réseau.connexions") }}
    </p>
    <v-divider v-if="connexions.length" />
    <v-list v-if="connexions.length" two-line dense>
      <v-list-item v-for="c in connexions" :key="c.addr">
        <v-list-item-avatar>
          {{ traduireEmpreinte(c.peer)[c.peer.length - 1] }}
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ traduireEmpreinte(c.peer) }}
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
import mixinLangues from "@/mixins/langues";

/*
import geoip from "ipfs-geoip";
await geoip.lookup(ipfs, exampleIp)
{
  "country_code": "US",
  "country_name": "USA",
  "region_code": "CA",
  "city": "Mountain View",
  "postal_code": "94040",
  "latitude": 37.3860,
  "longitude": -122.0838,
  "planet": "Earth"
}
*/

export default mixins(mixinIPA, mixinLangues).extend({
  name: "ongletRéseau",
  mixins: [mixinIPA, mixinLangues],
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
