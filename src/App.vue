<template>
  <v-app>
    <ops-langue />
    <alerte-erreur-constellation />
    <v-main class="pl-14">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
      <Navigation />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import Navigation from "@/components/Navigation.vue";
import opsLangue from "@/components/OpsLangue.vue";
import alerteErreurConstellation from "@/components/commun/alerteErreurConstellation.vue";

import initialiserKilimukku from "@/kilimukku/kilimukku-vue-i18n";
import mixinLangue from "@/mixins/langues";
import mixinIPA from "@/mixins/ipa";

export default mixins(mixinIPA, mixinLangue).extend({
  name: "App",

  components: {
    Navigation,
    opsLangue,
    alerteErreurConstellation,
  },

  data: () => ({
    //
  }),

  mixins: [mixinLangue, mixinIPA],

  methods: {
    initialiserSuivi: async function () {
      const oublierKilimukkku = await initialiserKilimukku({ appli: this });

      this.suivre([oublierKilimukkku]);
    },
  },

  mounted: function () {
    const langue = this.$store.state.paramètres.langue;
    if (langue) this.changerLangue(langue);
    const thèmeNuit = this.$store.state.paramètres.thèmeNuit;
    this.$vuetify.theme.dark = thèmeNuit;
  },
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
