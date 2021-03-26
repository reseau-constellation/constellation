<template>
  <v-list-item @click="$emit('click')">
    <v-list-item-content>
      {{ couper(tableau ? nom : id, 25) }}
      <div>
        <jeton-variable v-for="m in variables" :key="m" :id="m" />
      </div>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon color="error" @click.stop="effacer">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { traduireNom, couper } from "@/utils";
import { obtTableau, obtVarsTableau } from "@/ipa/tableaux";
import jetonVariable from "@/components/commun/jetonVariable";

export default {
  name: "itemTableau",
  props: ["id"],
  components: { jetonVariable },
  data: function() {
    return {
      tableau: null,
      variables: []
    };
  },
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return traduireNom(this.tableau.nom, lngs);
    }
  },
  methods: { couper },
  mounted: function() {
    obtTableau(this.id).then(t => {
      this.tableau = t;
    });
    obtVarsTableau(this.id).then(vrs => (this.variables = vrs));
  }
};
</script>

<style></style>
