<template>
  <v-menu offset-x :close-on-content-click="false" :disabled="!editer">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <span v-if="val !== undefined" :class="{ 'primary--text': editer }">
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
            :disabled="valsÉgales || !règles.numérique(valÉditée)"
            color="success"
            @click="() => actionModifié()"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn icon :disabled="valsÉgales" @click="() => réinitialiser()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLangues from "@/mixins/langues";

export default mixins(mixinLangues).extend({
  name: "celluleNumérique",
  props: ["val", "editer", "couleurActive"],
  mixins: [mixinLangues],
  data: function () {
    return {
      valÉditée: "",
    };
  },
  watch: {
    val: function (val) {
      this.valÉditée = val !== undefined ? this.formatterChiffre(val) : "";
    },
    systèmeNumération: function () {
      this.réinitialiser();
    },
  },
  computed: {
    valsÉgales: function (): boolean {
      console.log("valsÉgales", this.val === this.valNumérique(this.valÉditée));
      return this.val === this.valNumérique(this.valÉditée);
    },
    règles: function () {
      return {
        numérique:
          (val: string) => {
            return val !== undefined ? (!this.valNumérique(val) ? "Val erronée" : true) : false
          },
      };
    },
  },
  methods: {
    réinitialiser: function () {
      this.valÉditée =
        this.val !== undefined ? this.formatterChiffre(this.val) : "";
    },
    actionModifié: function () {
      if (!this.valsÉgales) {
        this.$emit("edite", { val: this.valNumérique(this.valÉditée) });
      }
    },
    valNumérique: function (val: string) {
      console.log(1, typeof val)
      if (!val || !val.length) return;
      //@ts-ignore
      console.log(2, "ici", !isNaN(val), !isNaN(parseFloat(val)))
      // De https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
      //@ts-ignore
      if (!isNaN(val) && !isNaN(parseFloat(val))) {
        console.log(3, val, Number(val))
        return Number(val);
      } else {
        const convertie = this.texteÀChiffre(val, this.systèmeNumération);
        return convertie || undefined;
      }
    },
  },
  mounted: function () {
    if (this.val !== undefined)
      this.valÉditée = this.formatterChiffre(this.val);
  },
});
</script>

<style></style>
