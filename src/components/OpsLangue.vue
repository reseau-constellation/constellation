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
    <span>
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
      <v-divider />
      <dialogue-traductions-interface>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-pencil-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              Contribuer
            </v-list-item-content>
          </v-list-item>
        </template>
      </dialogue-traductions-interface>
    </span>
  </v-menu>
</template>

<script>
import mixinLangues from "@/mixins/langues";
import opLangue from "@/components/commun/OpLangue";
import dialogueTraductionsInterface from "@/components/commun/dialogueTraductionsInterface";

export default {
  name: "opsLangue",
  components: { opLangue, dialogueTraductionsInterface },
  mixins: [mixinLangues],
};
</script>

<style></style>
