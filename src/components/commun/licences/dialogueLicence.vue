<template>
  <v-dialog v-model="dialogue" scrollable max-width="400">
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card>
      <v-card-title class="headline">
        {{ nomLicence }}
        <v-menu
          v-if="permissionModifier"
          transition="slide-y-transition"
          bottom
          offset-x
          min-width="225"
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" class="mx-2" icon small>
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <v-list class="overflow-y-auto" style="max-height: 300px">
            <v-list-item
              v-for="l in licences"
              :key="l"
              @click="$emit('changerLicence', { licence: l })"
            >
              <v-list-item-avatar>
                <v-icon v-if="l === licence">mdi-check</v-icon>
              </v-list-item-avatar>
              <v-list-item-content
                :class="{ 'font-weight-bold': l === licence }"
                >{{ obtNomLicence(l) }}</v-list-item-content
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
      <v-divider />

      <v-card-text>
        <p class="mt-3 mb-0">
          <v-icon small>mdi-alert-circle-outline</v-icon>
          {{ $t("licences.avertissement") }}
        </p>
        <div class="text-center">
          <v-btn
            class="mx-auto my-3"
            outlined
            small
            :disabled="!lienLicenceValid"
            @click="ouvrirLienLicence($t(`licences.info.${licence}.lien`))"
          >
            <v-icon left>mdi-scale-balance</v-icon>
            <div v-if="lienLicenceValid">
              {{ $t("licences.lire") }}
              <v-icon right>mdi-open-in-new</v-icon>
            </div>
            <div v-else>{{ $t("licences.aucunLien") }}</div>
          </v-btn>
        </div>
        <v-divider />

        <p class="mb-0 text-overline">{{ $t("licences.droits.sousTitre") }}</p>
        <p v-if="!droits.length" class="text--disabled">
          {{ $t("licences.droits.aucune") }}
        </p>
        <jeton-droit
          v-for="d in droits"
          :key="d"
          :droit="d"
          outlined
          small
          label
          class="ma-1 my-1"
        />
        <p class="mb-0 text-overline">
          {{ $t("licences.conditions.sousTitre") }}
        </p>
        <p v-if="!conditions.length" class="text--disabled">
          {{ $t("licences.conditions.aucune") }}
        </p>
        <jeton-condition
          v-for="c in conditions"
          :key="c"
          :condition="c"
          outlined
          small
          label
          class="ma-1 my-1"
        />
        <p class="mb-0 text-overline">
          {{ $t("licences.limitations.sousTitre") }}
        </p>
        <p v-if="!limitations.length" class="text--disabled">
          {{ $t("licences.limitations.aucune") }}
        </p>
        <jeton-limitation
          v-for="l in limitations"
          :key="l"
          :limitation="l"
          outlined
          small
          label
          class="ma-1 my-1"
        />
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" text outlined @click="dialogue = false">
          {{ $t("communs.fermer") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import mixinLicences from "@/mixins/licences";
import jetonDroit from "@/components/commun/licences/jetonDroit.vue";
import jetonLimitation from "@/components/commun/licences/jetonLimitation.vue";
import jetonCondition from "@/components/commun/licences/jetonCondition.vue";

export default mixins(mixinLicences).extend({
  name: "dialogueLicence",
  props: {
    idLicence: { type: String },
    permissionModifier: { default: false, type: Boolean },
  },
  components: { jetonDroit, jetonCondition, jetonLimitation },
  mixins: [mixinLicences],
  data: function () {
    return {
      dialogue: false,
    };
  },
  watch: {
    idLicence: function(val) {
      this.licence = val
    }
  }
});
</script>

<style></style>
