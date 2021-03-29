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
  destroyed() {
    this.crochets.map(c => c());
  }
};
