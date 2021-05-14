<template>
  <span>
    <input type="file" ref="fileInput" style="display:none"  @change="onFilePicked"/>
    <v-btn icon small  @click="onPickFile">
      <v-icon small>mdi-upload</v-icon>
    </v-btn>

    <!--<v-file-input v-if="editer" hide-details class="my-0 py-0"></v-file-input>-->
  </span>
</template>

<script>
export default {
  name: "celluleFichier",
  props: ["val", "editer"],
  data: function() {
    return {
      fichier: null,
      urlFichier: null
    }
  },
  methods: {
    onPickFile () {
      this.$refs.fileInput.click()
    },
    onFilePicked (event) {
      const files = event.target.files
      let filename = files[0].name
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.urlFichier = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.fichier = files[0]
    }
  }
};
</script>

<style></style>
