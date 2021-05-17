<template>
  <span>
    <input
      type="file"
      ref="fileInput"
      style="display:none"
      @change="fichierChoisi"
    />
    <v-fade-transition v-if="editer" leave-absolute>
      <v-progress-circular
        v-if="téléversementEnProgrès"
        size="20"
        color="info"
        indeterminate
      ></v-progress-circular>
      <v-btn v-else icon small @click="choisirFichier">
        <v-icon small :color="couleurActive">mdi-upload</v-icon>
      </v-btn>
    </v-fade-transition>

    <v-fade-transition leave-absolute>
      <v-progress-circular
        v-if="téléchargementEnProgrès"
        size="20"
        color="info"
        indeterminate
      ></v-progress-circular>
      <v-btn v-else-if="val && !editer" icon small @click="() => télécharger()">
        <v-icon small>mdi-download</v-icon>
      </v-btn>
    </v-fade-transition>
    <v-dialog
      v-model="vis"
      v-if="val"
      max-width="400"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon small v-bind="attrs" @click="obtURL"
          v-on="on"
        >
          <v-icon small>mdi-eye</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          {{ couper(nomFichier, 10) }} <span class="text--disabled">[ {{ val.ext }} ]</span>
          <v-spacer/>
          <v-fade-transition v-if="editer" leave-absolute>
            <v-progress-circular
              v-if="téléchargementEnProgrès"
              size="30"
              color="info"
              indeterminate
            ></v-progress-circular>
            <v-btn v-else icon :disabled="!url" @click="() => télécharger()">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </v-fade-transition>

        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-skeleton-loader v-if="!url" class="ma-4" type="image" />
          <v-img v-else-if="formats.images.includes(val.ext.toLowerCase())" :src="url" class="ma-4" contain/>
          <vue-plyr v-else-if="formats.vidéo.includes(val.ext.toLowerCase())">
            <video
              controls
              crossorigin
              playsinline
              data-poster="poster.jpg"
            >
              <source
                :src="url"
                type="video/mp4"
              />
            </video>
          </vue-plyr>
          <vue-plyr v-else-if="formats.audio.includes(val.ext.toLowerCase())">
            <audio controls crossorigin playsinline>
              <source
                  :src="url"
                  :type="'audio/'+val.ext"
              />
            </audio>
          </vue-plyr>
          <div v-else class="text-center">
            <p class="text-h6 mt-5">Ce format de fichier ne peut pas être prévisualisé pour le moment.</p>
            <v-img :src="image('vide')" class="my-5" contain height="175px" />
            <v-btn
              class="mx-2"
              color="primary"
              tiled
              outlined
              append
              @click="() => télécharger()"
            >
              Télécharger
              <v-icon right>
                mdi-download
              </v-icon>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import { téléchargerURL, couper } from "@/utils";
import mixinImage from "@/mixins/images";

export default {
  name: "celluleFichier",
  props: ["val", "editer", "couleurActive"],
  mixins: [mixinImage],
  data: function() {
    return {
      téléchargementEnProgrès: false,
      téléversementEnProgrès: false,
      url: undefined,
      vis: false,
      formats: {
        images: ["webp", "svg", "png", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "gif", "avif", "apng"],
        vidéo: ["mp4"],
        audio: ["mp3", "ogg"]
      }
    };
  },
  computed: {
    nomFichier: function() {
      const { cid, ext } = this.val;
      const nomFichier = `${cid}.${ext}`
      return nomFichier
    }
  },
  methods: {
    couper,
    choisirFichier() {
      this.$refs.fileInput.click();
    },
    async fichierChoisi(e) {
      this.téléversementEnProgrès = true
      const fichier = e.target.files[0];
      const extention = fichier.name.split(".").pop();
      const lecteurFichier = new FileReader();
      const idDoc = await this.$ipa.ajouterÀSFIP(fichier);
      this.téléversementEnProgrès = false
      this.$emit("edite", { val: { cid: idDoc, ext: extention } });
    },
    async obtURL() {
      const { cid } = this.val;
      const octets = await this.$ipa.obtFichierSFIP(cid);
      const url = URL.createObjectURL(new Blob([octets.buffer]));
      this.url = url
    },
    async télécharger() {
      this.téléchargementEnProgrès = true
      await this.obtURL()
      await téléchargerURL(this.url, this.nomFichier);
      this.téléchargementEnProgrès = false
    }
  }
};
</script>

<style></style>
