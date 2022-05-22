<template>
  <dialogue-info-motclef :id="id">
    <template v-slot:activator="{ on, attrs }">
      <v-chip
        v-on="on"
        v-bind="attrs"
        :close="permissionModifier"
        outlined
        small
        label
        class="mx-1 my-1"
        close-icon="mdi-close"
        @click:close="$emit('effacer', { id })"
      >
        {{ couper(nom, 15) }}
      </v-chip>
    </template>
  </dialogue-info-motclef>
</template>

<script lang="ts">
import mixins from "vue-typed-mixins";

import { couper, traduireNom } from "@/utils";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

import dialogueInfoMotclef from "@/components/motsClefs/dialogueInfoMotClef.vue";

export default mixins(mixinIPA, mixinLangues).extend({
  name: "jetonMotClef",
  props: ["id", "permissionModifier"],
  mixins: [mixinLangues, mixinIPA],
  components: { dialogueInfoMotclef },
  data: function () {
    return {
      noms: {} as { [key: string]: string },
    };
  },
  computed: {
    nom: function (): string {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.languesPréférées)
        : this.id.slice(9);
    },
  },
  methods: {
    couper,
    initialiserSuivi: async function () {
      const oublierNoms = await this.$ipa.motsClefs!.suivreNomsMotClef({
        id: this.id,
        f: (noms) => {
          this.noms = noms;
        },
      });

      this.suivre([oublierNoms]);
    },
  },
});
</script>

<style></style>
