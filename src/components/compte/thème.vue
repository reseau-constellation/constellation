<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="4">
        <p class="px-0 text-overline">{{ $t('compte.onglets.thème.couleurs') }}</p>
        <v-switch
          v-model="thèmeNuit"
          inset
          :prepend-icon="
            thèmeNuit ? 'mdi-weather-night' : 'mdi-white-balance-sunny'
          "
          :label="$t('compte.options.thèmeNuit')"
        ></v-switch>
      </v-col>
      <v-col cols="4">
        <p class="px-0 text-overline">{{ $t('compte.onglets.thème.culture') }}</p>
        <v-radio-group
          v-model="image"
          class="mt-0"
          :label="$t('compte.options.thèmeImages')"
        >
          <v-radio value="unDraw" label="unDraw"/>
          <v-radio value="வள்ளுவர் வள்ளலார் வட்டம்" label="வள்ளுவர் வள்ளலார் வட்டம்" />
        </v-radio-group>
      </v-col>
      <v-col cols="4">
        <p class="px-0 text-overline">{{ $t('compte.onglets.thème.langue') }}</p>
        <v-select
          :items="langues"
          :value="langue"
          :label="$t('compte.options.langue')"
          outlined
          dense
          hide-details
          prepend-icon="mdi-earth"
          class="pb-5"
          @change="changerLangue"
        >
          <template v-slot:item="{ item }">
            <op-langue
              :nom="item"
              :sélectionnée="item === langue"
              :progrès="progrès(item)"
              @click="changerLangue(item)"
            />
          </template>
        </v-select>
        <v-select
          :items="langues"
          :value="langue"
          :label="$t('compte.options.numération')"
          outlined
          dense
          hide-details
          prepend-icon="mdi-abacus"
          class="py-5"
          @change="changerNumération()"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import opLangue from "@/components/commun/OpLangue";
import mixinLangues from "@/mixins/langues";

export default {
  name: "ongletThème",
  components: { opLangue },
  mixins: [mixinLangues],
  data: function() {
    return {
      thèmeNuit: this.$vuetify.theme.dark,
      image: "unDraw"
    };
  },
  watch: {
    thèmeNuit: function(val) {
      this.$vuetify.theme.dark = val;
    }
  }
}
</script>

<style>

</style>
