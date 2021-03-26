<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{
              $vuetify.rtl ? "mdi-chevron-left" : "mdi-chevron-right"
            }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <v-card-title>
        Créez une nouvelle base de données
      </v-card-title>
      <v-divider />
      <v-text-field
        outlined
        dense
        hide-details
        label="Nom de la base de données"
      ></v-text-field>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "NouvelleBD",
  computed: {
    petitPousset: function() {
      return [
        { text: "Données", href: "/bd" },
        { text: this.$t("bd.nouvelle.petitPousset"), disabled: true }
      ];
    }
  }
};
</script>

<style></style>
