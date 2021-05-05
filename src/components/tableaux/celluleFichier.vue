<template>
  <span>
    {{ empreinte }}
    <!--<v-file-input v-if="editer" hide-details class="my-0 py-0"></v-file-input>-->
  </span>
</template>

<script>
export default {
  name: "celluleFichier",
  props: ["val", "editer", "empreinte"]
};
</script>

<style></style>
