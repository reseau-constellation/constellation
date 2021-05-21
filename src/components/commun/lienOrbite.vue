<template>
  <v-menu
    transition="slide-y-transition"
    bottom
    :close-on-content-click="false"
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>mdi-link</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>{{ lien }}</v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="copier(lien)">
            <v-icon>{{ copié ? "mdi-check" : "mdi-content-copy" }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "lienOrbit",
  props: ["lien"],
  data: function () {
    return {
      copié: false,
    };
  },
  methods: {
    async copier(texte) {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(texte);
      this.copié = true;
    },
  },
};
</script>

<style></style>
