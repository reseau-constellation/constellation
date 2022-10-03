<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-avatar size="20">
      <v-icon v-if="traduction">mdi-check</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <texteTronqué :texte="texteOriginal || clef" :longueurMax="30" />
      </v-list-item-title>
      <v-list-item-subtitle>
        <texteTronqué
          :texte="traduction || '[' + $t('itemListeTrads.இல்லை') + ']'"
          :longueurMax="30"
        />
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import mixinLangues from "@/mixins/langues";
import texteTronqué from "@/components/commun/texteTronqué.vue";

export default {
  name: "itemListeTrads",
  props: ["clef", "texteOriginal", "traduction"],
  components: {texteTronqué},
  mixins: [mixinLangues],
};
</script>

<style></style>
