<template>
  <v-list-item>
    <v-list-item-avatar>
      <avatar-profil />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title> Nom de l'utilisatrice </v-list-item-title>
      <v-divider />
      <span class="text--secondary">{{
        traduireClef(clefSélectionnée, [langueCible])
      }}</span>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: "itemTradCommunauté",
};
</script>

<style></style>
