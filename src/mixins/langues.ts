import { rutzib_chabäl as écriture, rucholanem_tzibanem as orientationÉcriture } from "nuchabal";

const ORIG = 'fr'

export default {
  data: function() {
    return {
      orig: ORIG
    }
  },
  computed: {
    langue: function() {
      return this.$i18n.locale;
    },
    langues: function() {
      return Object.keys(this.$i18n.messages).sort((a, b) => {
        return b === this.orig ? 1 : this.progrès(a) < this.progrès(b) ? 1 : -1;
      });
    },
    systèmeNum: function() {
      return this.$store.state.paramètres.numération
    }
  },
  methods: {
    changerLangue: function(lng) {
      this.$i18n.fallbackLocale = [this.$i18n.locale, "fr"];
      this.$vuetify.lang.current = lng;
      this.$i18n.locale = lng;
      const orientation = orientationÉcriture(écriture(lng))
      this.$vuetify.rtl = orientation && orientation.includes('←')
      this.$store.commit('paramètres/changerLangue', { langue: lng })
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
      this.$store.commit('paramètres/changerNumération', { système })
    }
  }
}
