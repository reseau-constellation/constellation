<template>
  <v-menu offset-x :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-chip outlined label small v-bind="attrs" v-on="on" class="mx-1 my-1">
        {{ couper(nom, 15) }}
      </v-chip>
    </template>
    <carte-variable :id="id" />
  </v-menu>
</template>

<script>
import { traduireNom, couper } from "@/utils";
import carteVariable from "@/components/commun/carteVariable";
import mixinIPA from "@/mixins/ipa";
import mixinLangues from "@/mixins/langues";

export default {
  name: "jetonVariable",
  props: ["id"],
  components: { carteVariable },
  mixins: [mixinLangues, mixinIPA],
  data: function() {
    return {
      permissionÉcrire: false,
      noms: null
    };
  },
  computed: {
    langues: function() {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    nom: function() {
      return Object.keys(this.noms).length
        ? traduireNom(this.noms, this.langues)
        : this.id;
    }
  },
  methods: {
    couper,
    initialiserSuivi: async function() {
      this.permissionÉcrire = await this.$ipa.permissionÉcrire(this.id);

      const oublierNoms = await this.$ipa.variables.suivreNomsVariable(
        this.id,
        noms => {
          this.nomd = noms;
        }
      );

      this.suivre([oublierNoms]);
    }
  }
};
</script>

<style></style>
