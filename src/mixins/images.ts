import Vue from "vue";

const imagesThème: { [key: string]: any } = {
  constr: {
    unDraw: require("@/assets/undraw/undraw_under_construction_46pa.svg"),
    வவவ: require("@/assets/வவவ/குயவர்.svg"),
  },
  docs: {
    unDraw: require("@/assets/undraw/undraw_book_lover_mkck.svg"),
    வவவ: require("@/assets/வவவ/சோதிடம்.svg"),
  },
  recherche: {
    unDraw: require("@/assets/undraw/undraw_not_found_60pq.svg"),
    வவவ: require("@/assets/வவவ/மீனவர்கள்.svg"),
  },
  profilFemme: {
    unDraw: require("@/assets/undraw/undraw_female_avatar_w3jk.svg"),
    வவவ: require("@/assets/வவவ/தஞ்சாவூர்_பொம்மை_பெண்.svg"),
  },
  profilHomme: {
    unDraw: require("@/assets/undraw/undraw_male_avatar_323b.svg"),
    வவவ: require("@/assets/வவவ/தஞ்சாவூர்_பொம்மை_ஆண்.svg"),
  },
  automation: {
    unDraw: require("@/assets/undraw/undraw_real-time_sync_o57k.svg"),
    // வவவ: require("@/assets/வவவ/பொங்கல்_வண்டி.svg"),
  },
  problème: {
    unDraw: require("@/assets/undraw/undraw_towing_6yy4.svg"),
    வவவ: require("@/assets/வவவ/ஜல்லிக்கட்டு.svg"),
  },
  favoris: {
    unDraw: require("@/assets/undraw/undraw_Appreciation_re_p6rl.svg"),
    வவவ: require("@/assets/வவவ/அஞ்சறைப்பெட்டி.svg"),
  },
  conditions: {
    unDraw: require("@/assets/undraw/undraw_Terms_re_6ak4.svg"),
    வவவ: require("@/assets/வவவ/கபடி_ஆட்டம்.svg"),
  },
  logoBD: {
    unDraw: require("@/assets/undraw/undraw_Projections_re_1mrh.svg"),
  },
  dispositif: {
    unDraw: require("@/assets/undraw/undraw_Mobile_re_q4nk.svg"),
  },
  vide: {
    unDraw: require("@/assets/undraw/undraw_adventure_map_hnin.svg"),
    வவவ: require("@/assets/வவவ/கிணறு.svg"),
  },
};

export default Vue.extend({
  methods: {
    image(clef: string): string {
      let thème = this.$store.state.paramètres.thèmeImages;
      const nuit = this.$store.state.paramètres.thèmeNuit;
      if (nuit && thème === "வவவ") {
        thème = "unDraw";
      }
      const img =
        imagesThème[clef][thème] || Object.values(imagesThème[clef])[0];
      return img;
    },
  },
});
