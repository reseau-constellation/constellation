<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val" :class="{ 'primary--text': editer }">
          {{ formatterDate(val) }}
        </span>
        <v-btn small icon v-else-if="editer">
          <v-icon small :color="couleurActive">mdi-pencil-plus</v-icon>
        </v-btn>
      </span>
    </template>
    <v-card class="pa-2">
      <v-text-field v-model="valÉditée" @blur="() => actionModifié()" />
    </v-card>
  </v-menu>
</template>

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "celluleDate",
  props: ["val", "editer", "couleurActive"],
  mixins: [mixinLangues],
  data: function() {
    return {
      valÉditée: this.val
    };
  },
  watch: {
    val: function(val) {
      this.valÉditée = val;
    }
  },
  methods: {
    actionModifié: function() {
      if (this.val !== this.valÉditée) {
        this.$emit("edite", { val: this.valÉditée });
      }
    }
  }
};
</script>

<style></style>
