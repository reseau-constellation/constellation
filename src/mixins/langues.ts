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
    }
  },
  methods: {
    changerLangue: function(lng) {
      this.$i18n.fallbackLocale = [this.$i18n.locale, "fr"];
      this.$vuetify.lang.current = lng;
      this.$i18n.locale = lng;
      this.$vuetify.rtl = false; // à faire
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
    }
  }
}
