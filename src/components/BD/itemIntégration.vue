<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-avatar>
      <v-icon v-if="erreurs.length" color="warning" right
        >mdi-alert-outline</v-icon
      >
      <v-icon v-else color="success" left>mdi-check</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-row>
        <v-col cols="3">
          Monfichier.csv
        </v-col>
        <v-col cols="3">
          <v-progress-circular
            class="me-2"
            :rotate="270"
            :width="4"
            :size="27"
            :value="(temps / tempsMax) * 100"
            color="primary"
            @click="temps = 12"
          ></v-progress-circular>
          Mise à jour dans {{ temps }} secondes
        </v-col>
        <v-col cols="3"> </v-col>
      </v-row>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: "itemIntégration",
  data: function () {
    return {
      tempsMax: 12,
      temps: 12,
      erreurs: [],
    };
  },
  mounted: function () {
    setInterval(() => {
      this.temps <= 0 ? (this.temps = this.tempsMax) : this.temps--;
    }, 1000);
    setInterval(() => (this.erreurs = this.erreurs.length ? [] : [1, 2]), 3000);
  },
};
</script>

<style></style>
