<template>
  <v-container>
    <v-card flat>
      <v-card-subtitle>
        <v-breadcrumbs :items="petitPousset" class="pa-0">
          <template v-slot:divider>
            <v-icon>{{ $vuetify.rtl ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="$router.push(item.href)"
            >
              {{ item.text }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-card-subtitle>
      <v-img
        :src="(bd && bd.logo) ? bd.logo : require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
        height="100px"
        contain
      ></v-img>
      <v-card-title v-if="this.tableau">
        {{ couper(nom, 45) }}</v-card-title>
      <v-card-subtitle>{{ idTableau }}</v-card-subtitle>
      <v-card-text>
        <v-data-table
         :headers="entête"
         :items="données"
        >
        <template
          v-slot:no-data
        >
          {{ $t('tableau.vide') }}
        </template>
        </v-data-table>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { obtTableau } from "@/ipa/tableaux"
import { nomBD } from "@/ipa/utils"
import { couper } from "@/utils"

export default {
  name: "visTableau",
  data: function() {
    return {
      tableau: null,
      données: [
        { date: '2000-01-01', préc: '2', tmax: '24', tmin: '18' },
        { date: '2000-01-02', préc: '0', tmax: '22', tmin: '13' },
      ],
      entête: [
        { text: 'Date', value: 'date' },
        { text: 'Précipitation', value: 'préc' },
        { text: 'Température max', value: 'tmax' },
        { text: 'Température min', value: 'tmin' },
      ]
    }
  },
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return nomBD(this.tableau, lngs)
    },
    idBD: function() {
      return this.$route.params.id
    },
    idTableau: function() {
      return this.$route.params.idTableau
    },
    petitPousset: function() {
      console.log(this.idBD, this.idTableau)
      return [
        {text: 'Données', href: '/bd'},
        {text: couper(this.idBD, 15), href: `/bd/visualiser/${this.idBD}`},
        {text: couper(this.tableau ? this.nom : this.idTableau, 15)}
      ]
    }
  },
  methods: { couper },
  mounted: function() {
    obtTableau(this.idTableau).then(tbl=>{this.tableau = tbl})
  }
}
</script>

<style>

</style>
