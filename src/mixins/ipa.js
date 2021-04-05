export default {
  data: function() {
    return {
      crochets: []
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
    this.$ipa.on("pret", this.initialiserSuivi.bind(this));
    if (this.$ipa.pret) {
      this.initialiserSuivi();
    }
  },
  destroyed() {
    this.$ipa.off("pret", this.initialiserSuivi.bind(this));
    this.crochets.map(c => c());
  }
};
