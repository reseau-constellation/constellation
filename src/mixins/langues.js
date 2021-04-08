import {
  rutzibChabäl as écriture,
  rubiChabäl as nomDeLangue,
  rucholanemTzibanem as orientationÉcriture,
  retamabälChabäl as infoLangues,
  runukChabäl as codeLangue
} from "nuchabal";
import { உரைக்கு } from "ennikkai";
import { mapGetters } from "vuex";

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
      const liste_langues = [
        ...new Set([
          ...Object.keys(infoLangues),
          ...Object.keys(this.$i18n.messages)
        ])
      ];
      return liste_langues.sort((a, b) => {
        return b === this.orig ? 1 : this.progrès(a) < this.progrès(b) ? 1 : -1;
      });
    },
    languesNuchabal: () => {
      return Object.keys(infoLangues);
    },
    ...mapGetters({
      systèmeNumération: "paramètres/systèmeNumération"
    })
  },
  methods: {
    nomDeLangue,
    droiteÀGauche: function(langue) {
      const orientation = orientationÉcriture(écriture(langue));
      return Boolean(orientation && orientation.includes("←"));
    },
    changerLangue(lng) {
      this.$i18n.fallbackLocale = [this.$i18n.locale, "fr"];
      this.$vuetify.lang.current = codeLangue(nomDeLangue(lng), "iso");
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
    },
    formatterChiffre: function(n) {
      return உரைக்கு(n, this.systèmeNumération);
    }
  }
};
