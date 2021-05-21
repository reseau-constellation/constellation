<template>
  <v-container class="text-center">
    <titre :entête="$t('projets.entête')" />
    <v-row>
      <v-col cols="12">
        <v-text-field
          outlined
          append-icon="mdi-filter"
          :label="$t('projets.filtrer')"
          class="mx-10"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <transition-group
          name="fade"
          mode="out-in"
          class="d-flex flex-wrap justify-center"
        >
          <v-card
            :key="0"
            class="mx-4 my-5 px-3 py-5 justify-start text-start"
            min-height="200px"
            width="250px"
          >
            <v-img
              :src="require('@/assets/undraw/undraw_blank_canvas_3rbb.svg')"
              height="100px"
              contain
            ></v-img>

            <v-card-title
              >{{ $t("projets.nouveau.entête") }}
              <v-spacer />
            </v-card-title>
            <v-divider />
            <v-card-subtitle>
              {{ $t("projets.nouveau.détails") }}
            </v-card-subtitle>
            <v-card-text> </v-card-text>
          </v-card>
          <carte-projet
            v-for="prj in projets"
            :key="prj.id"
            :projet="prj"
            @click="$router.push(`projets/visualiser/${prj.id}`)"
          />
        </transition-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre";
import { obtProjets } from "@/ipa/projets";
import carteProjet from "@/components/Projets/carteProjet";

export default {
  name: "Projets",
  components: { Titre, carteProjet },
  data: function () {
    return {
      projets: [],
    };
  },
  mounted: async function () {
    for await (const prj of obtProjets()) {
      this.projets = [...this.projets, prj];
    }
  },
};
</script>

<style></style>
