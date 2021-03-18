<template>
  <v-card
    class="mx-4 my-5 px-3 py-5 justify-start text-start"
    min-height="200px"
    width="250px"
    @click="$emit('click')"
  >
    <v-img
        :src="projet.logo || require('@/assets/undraw/undraw_Projections_re_1mrh.svg')"
      height="100px"
      contain
    ></v-img>

    <v-card-title
      >{{ nom }}
      <v-spacer />
      <!--<v-btn v-if="பதிவிறக்கம்.கிட்"
        :href="பதிவிறக்கம்.கிட்"
        icon
        rel=”noopener”
        target="_blank">
        <v-icon>mdi-git</v-icon>
      </v-btn>
      <v-btn v-if="பதிவிறக்கம்.ஆவணங்கள்"
        :href="பதிவிறக்கம்.ஆவணங்கள்"
        icon
        rel=”noopener”
        target="_blank">
        <v-icon>mdi-file-document-multiple-outline</v-icon>
      </v-btn> -->
    </v-card-title>
    <v-divider />
    <v-card-subtitle>{{ projet.détails }}</v-card-subtitle>
    <v-card-text>
      <!--
      <v-chip v-if="பதிவிறக்கம்.வகை"
       outlined label small class="ma-1"
       @click="வகைகள்=[பதிவிறக்கம்.வகை]"
      >
       <v-icon left small>
        {{ வகை_படவுரு(பதிவிறக்கம்.வகை) }}
       </v-icon>
       {{ பதிவிறக்கம்.வகை }}
      </v-chip>

      <v-chip v-if="பதிவிறக்கம்.நிலை"
       outlined label small class="ma-1"
       @click="நிலைகள்=[பதிவிறக்கம்.நிலை]"
      >
       <v-icon left small>
         {{ மேம்பாடு_படவுரு(பதிவிறக்கம்.நிலை) }}
       </v-icon>
       {{ பதிவிறக்கம்.நிலை }}
     </v-chip>

      <v-chip
       v-for="நி in பதிவிறக்கம்.நிரல்மொழி" :key="நி"
       outlined label small class="ma-1"
       @click="நிரல்மொழிகள்=[நி]"
      >
       <v-icon left small>
        {{ நிரல்மொழி_படவுரு(நி) }}
       </v-icon>
       {{ நி }}
     </v-chip>

      <div v-if="பதிவிறக்கம்.பதிவிறக்கம்" class="mt-2">
        பதிவிறக்கம்
        <v-divider/>
        <div v-for="ப in பதிவிறக்கம்.பதிவிறக்கம்" :key="ப">
          <v-chip label class="ms-5 my-2 px-2">
            {{ ப }}
            <v-btn icon small>
              <v-icon small>mdi-content-copy</v-icon>
            </v-btn>
          </v-chip>
        </div>
      </div> -->
    </v-card-text>
  </v-card>
</template>

<script>
import { nomBD } from '@/ipa/utils'
export default {
  name: "carteProjet",
  props: ["projet"],
  computed: {
    nom: function() {
      const lngs = [this.$i18n.locale, ...this.$i18n.fallbackLocale];
      return nomBD(this.projet, lngs)
    }
  }
};
</script>

<style></style>
