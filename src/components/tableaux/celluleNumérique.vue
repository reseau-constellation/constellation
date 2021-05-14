<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val" :class="editer ? 'primary--text' : 'secondary--text'">
          {{ formatterChiffre(val) }}
        </span>
        <v-btn small icon v-else-if="editer">
          <v-icon small color="primary">mdi-pencil-plus</v-icon>
        </v-btn>
      </span>
    </template>
    <v-card class="pa-2">
      <v-text-field
        v-model="valÉditée"
        @blur="actionModifié"
      />
    </v-card>
  </v-menu>
</template>

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "celluleNumérique",
  props: ["val", "editer"],
  mixins: [mixinLangues],
  data: function() {
    return {
      valÉditée: this.val
    }
  },
  watch: {
    val: function(val) {
      this.valÉditée = val
    }
  },
  methods: {
    actionModifié: function() {
      const val = this.val === false ? true : (this.val === true ? undefined : false);
      if (this.val.trim() !== this.valÉditée.trim()) {
        this.$emit("edite", { val: this.valÉditée.trim() });
      }
    }
  }
};
</script>

<style></style>
