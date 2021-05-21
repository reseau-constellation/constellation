<template>
  <v-card max-width="400">
    <v-card-title>
      {{ $t("qualité.titre") }}
    </v-card-title>
    <v-card-subtitle v-if="permissionÉcrire">
      {{ $t("qualité.sousTitre") }}
    </v-card-subtitle>

    <v-card-text>
      <v-list>
        <v-divider />
        <v-list-item
          v-for="[c, v] in Object.entries(score).filter(
            (x) => x[0] !== 'total'
          )"
          :key="c"
        >
          <v-list-item-avatar>
            <v-progress-circular
              :rotate="270"
              :width="5"
              :value="v ? v : 0"
              :color="couleurScore(v).couleur"
            >
              {{ v }}
            </v-progress-circular>
          </v-list-item-avatar>
          <v-list-item-content>
            {{ $t(`qualité.sousTitres.${c}`) }}
            <span
              :style="`color:${couleurScore(v).couleur}`"
              class="font-weight-bold"
            >
              {{ couleurScore(v).note }}
            </span>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { couleurScore } from "@/utils";

export default {
  name: "CarteQualité",
  props: ["score", "permissionÉcrire"],
  methods: { couleurScore },
};
</script>

<style></style>
