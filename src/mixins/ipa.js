export default {
  data: function() {
    return {
      crochets: [],
      crochetIPA: null
    };
  },
  methods: {
    suivre(crochet) {
      if (!Array.isArray(crochet)) {
        crochet = [crochet];
      }
      this.crochets = [...crochet, ...this.crochets];
    }
  },
  mounted: function() {
    this.crochetIPA = this.initialiserSuivi.bind(this)
    this.$ipa.on("pret", this.crochetIPA);
    if (this.$ipa.pret) {
      this.initialiserSuivi();
    }
  },
  destroyed() {
    this.$ipa.off("pret", this.crochetIPA);
    this.crochets.map(c => c());
  }
};
