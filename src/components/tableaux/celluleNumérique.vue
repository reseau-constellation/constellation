<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val !== undefined" :class="{'primary--text': editer }">
          {{ formatterChiffre(val) }}
        </span>
        <v-btn small icon v-else-if="editer">
          <v-icon small :color="couleurActive">mdi-pencil-plus</v-icon>
        </v-btn>
      </span>
    </template>
    <v-card class="pa-2">
      <v-text-field
        v-model="valÉditée"
        :rules="[règles.numérique]"
        @keydown.enter="() => actionModifié()"
      >
        <template v-slot:append-outer>
          <v-btn
            icon
            :disabled="valsÉgales || !règles.numérique()"
            color="success"
            @click="() => actionModifié()"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            icon
            :disabled="valsÉgales"
            @click="() => réinitialiser()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </v-card>
  </v-menu>
</template>

<script>
import mixinLangues from "@/mixins/langues";

export default {
  name: "celluleNumérique",
  props: ["val", "editer", "couleurActive"],
  mixins: [mixinLangues],
  data: function() {
    return {
      valÉditée: "",
      règles: {
        numérique: () => this.valÉditéeNumérique !== undefined
      }
    };
  },
  watch: {
    val: function(val) {
      this.valÉditée = val !== undefined ? this.formatterChiffre(val) : "";
    },
    systèmeNumération: function() {
      this.réinitialiser()
    }
  },
  computed: {
    valÉditéeNumérique: function() {
      if (!this.valÉditée.length) return

      // De https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
      if (!isNaN(this.valÉditée) && !isNaN(parseFloat(this.valÉditée))) {
        return Number(this.valÉditée)
      } else {
        const converti = this.texteÀChiffre(this.valÉditée, this.systèmeNumération)
        return converti || undefined
      }
    },
    valsÉgales: function() {
      return this.val === this.valÉditéeNumérique
    }
  },
  methods: {
    réinitialiser: function() {
      this.valÉditée = this.val !== undefined ? this.formatterChiffre(this.val): "";
    },
    actionModifié: function() {
      if (!this.valsÉgales) {
        this.$emit("edite", { val: this.valÉditéeNumérique });
      }
    }
  },
  mounted: function() {
    if (this.val !== undefined) this.valÉditée = this.formatterChiffre(this.val)
  }
};
</script>

<style></style>
