<template>
  <v-container>
    <titre :entête="$t('conditions.entête')" :image="image('conditions')" />

    <v-card flat class="px-5">
      <template v-for="(c, i) in conditions">
        <div
          v-if="c.genre === 'p' || c.genre === 't'"
          v-html="compilerMarkdown($t(`conditions.${c.texte}`))"
          :class="c.genre === 't' ? 'text-h6' : ''"
          :key="i"
        />
        <span v-else-if="c.genre === 'b'" :key="i">
          <v-checkbox
            v-model="acceptées"
            :label="$t('conditions.jaccepte')"
            @change="e => accepter(e)"
          />
          <v-btn color="primary" tiled outlined small class="mb-5" @click="$router.push('/accueil')">
            {{ $t("conditions.retour") }}
          </v-btn>
        </span>
      </template>
    </v-card>
  </v-container>
</template>

<script>
import Titre from "@/components/commun/Titre"
import mixinImage from "@/mixins/images";
import marked from "marked";

export default {
  name: "Favoris",
  components: { Titre },
  mixins: [mixinImage],
  data: function() {
    return {
      acceptées: this.$store.state.conditions.acceptées,
      conditions: [
        {
          genre: "p",
          texte: "p0_1"
        },
        {
          genre: "p",
          texte: "p0_2"
        },
        {
          genre: "p",
          texte: "p0_3"
        },
        {
          genre: "b"
        },
        {
          genre: "t",
          texte: "t1"
        },
        {
          genre: "p",
          texte: "p1_1"
        },
        {
          genre: "p",
          texte: "p1_2"
        },
        {
          genre: "t",
          texte: "t2"
        },
        {
          genre: "p",
          texte: "p2_1"
        },
        {
          genre: "p",
          texte: "p2_2"
        },
        {
          genre: "p",
          texte: "p2_3"
        },
        {
          genre: "t",
          texte: "t3"
        },
        {
          genre: "p",
          texte: "p3_1"
        },
        {
          genre: "p",
          texte: "p3_2"
        },
        {
          genre: "p",
          texte: "p3_3"
        }
      ]
    }
  },
  methods: {
    compilerMarkdown: (texte) => {
      return marked(texte, { sanitize: true });
    },
    accepter: function(acceptées) {
      this.$store.commit('conditions/accepterConditions', { acceptées })
    }
  }
};
</script>

<style></style>
