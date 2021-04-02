import {
  rutzib_chabäl as écriture,
  rubi_chabäl as nomDeLangue,
  rucholanem_tzibanem as orientationÉcriture,
  retamabäl_chabäl as infoLangues
} from "nuchabal";

const ORIG = "fr";

export default {
  data: function() {
    return {
      orig: ORIG
    };
  },
  computed: {
    langue: function() {
      return this.$i18n.locale;
    },
    langues: function() {
      const liste_langues = [...new Set([...Object.keys(infoLangues), ...Object.keys(this.$i18n.messages)])]
      return liste_langues.sort((a, b) => {
        return b === this.orig ? 1 : this.progrès(a) < this.progrès(b) ? 1 : -1;
      });
    },
    systèmeNum: function() {
      return this.$store.state.paramètres.numération;
    },
    languesNuchabal: () => {
      return Object.keys(infoLangues);
    }
  },
  methods: {
    nomDeLangue,
    droiteÀGauche: function(langue) {
      const orientation = orientationÉcriture(écriture(langue));
      return orientation && orientation.includes("←");
    },
    changerLangue(lng) {
      this.$i18n.fallbackLocale = [this.$i18n.locale, "fr"];
      this.$vuetify.lang.current = lng;
      this.$i18n.locale = lng;
      this.$vuetify.rtl = this.droiteÀGauche(lng);
      this.$store.commit("paramètres/changerLangue", { langue: lng });
    },
    progrès: function(lng) {
      const messages = this.$i18n.messages;
      const extraireMessages = (d, préc) => {
        let msgs = [];
        for (const [c, v] of Object.entries(d)) {
          const clef = préc ? `${préc}.${c}` : c;
          if (typeof v === "string") {
            msgs.push(clef);
          } else {
            msgs = [...msgs, ...extraireMessages(v, clef)];
          }
        }
        return msgs;
      };
      const messagesOrig = extraireMessages(messages[this.orig]);
      const messagesLng = new Set(
        messages[lng] ? extraireMessages(messages[lng]) : []
      );
      const communs = messagesOrig.filter(c => messagesLng.has(c));
      return communs.length / messagesOrig.length;
    },
    changerNumération: function(système) {
      this.$store.commit("paramètres/changerNumération", { système: système });
    }
  }
};
