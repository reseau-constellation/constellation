<template>
  <span>
    <input
      type="file"
      ref="fileInput"
      style="display:none"
      @change="fichierChoisi"
    />
    <v-btn v-if="editer" icon small @click="choisirFichier">
      <v-icon small color="primary">mdi-upload</v-icon>
    </v-btn>
    <v-btn v-if="val" icon small @click="() => télécharger()">
      <v-icon small>mdi-download</v-icon>
    </v-btn>
  </span>
</template>

<script>
import { téléchargerURL } from "@/utils";

export default {
  name: "celluleFichier",
  props: ["val", "editer"],
  data: function() {
    return {};
  },
  methods: {
    choisirFichier() {
      this.$refs.fileInput.click();
    },
    async fichierChoisi(e) {
      const fichier = e.target.files[0];
      const extention = fichier.name.split(".").pop();
      const lecteurFichier = new FileReader();
      const idDoc = await this.$ipa.ajouterÀSFIP(fichier);
      this.$emit("edite", { val: { cid: idDoc, ext: extention } });
    },
    async télécharger() {
      const { cid, ext } = this.val;
      const nomFichier = `${cid}.${ext}`;
      const octets = await this.$ipa.obtFichierSFIP(cid);
      window.octets = octets;
      const url = URL.createObjectURL(new Blob([octets.buffer]));
      téléchargerURL(url, nomFichier);
    }
  }
};
</script>

<style></style>
