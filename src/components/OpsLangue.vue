<template>
  <v-menu
    transition="slide-y-transition"
    bottom
    offset-y
    offset-x
    min-width="225"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        absolute
        top
        :right="!$vuetify.rtl"
        :left="$vuetify.rtl"
        fab
        small
        class="mt-8"
      >
        <v-icon>mdi-earth</v-icon>
      </v-btn>
    </template>
    <v-list class="overflow-y-auto" style="max-height: 300px">
      <op-langue
        v-for="lng in langues"
        :key="lng"
        :code="lng"
        :sélectionnée="lng === langue"
        :progrès="progrès(lng)"
        @click="changerLangue(lng)"
      />
    </v-list>
  </v-menu>
</template>

<script>
import mixinLangues from "@/mixins/langues";
import opLangue from "@/components/commun/OpLangue";

export default {
  name: "opsLangue",
  components: { opLangue },
  mixins: [mixinLangues]
};
</script>

<style></style>
