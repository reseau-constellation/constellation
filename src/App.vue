<template>
  <v-app>
    <v-app-bar app dense>
      <div class="d-flex align-center">
        <v-toolbar-title>RésEau</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-earth</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Navigation/>
      <HelloWorld />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import Navigation from "./components/Navigation.vue";

export default Vue.extend({
  name: "App",

  components: {
    HelloWorld, Navigation
  },

  data: () => ({
    //
  })
});
</script>
