import Vue from "vue";
import {
  rutzibChabäl as écriture,
  rubiChabäl as nomDeLangue,
  rucholanemTzibanem as orientationÉcriture,
  retamabälChabäl as infoLangues,
  runukChabäl as codeLangue,
} from "nuchabal";
import { எண்ணுக்கு as texteÀChiffre, உரைக்கு as chiffreÀTexte } from "ennikkai";
import { mapGetters } from "vuex";

const ORIG = "fr";

export default {
  data: function () {
    return {
      langueOriginale: ORIG,
    };
  },
  computed: {
    langue: function () {
      return this.$i18n.locale;
    },
    languesPréférées: function () {
      return [this.$i18n.locale, ...this.$i18n.fallbackLocale];
    },
    langues: function () {
      const liste_langues = [
        ...new Set([
          ...Object.keys(infoLangues),
          ...Object.keys(this.$i18n.messages),
        ]),
      ];
      return liste_langues.sort((a, b) => {
        return b === this.langueOriginale ? 1 : this.progrès(a) < this.progrès(b) ? 1 : -1;
      });
    },
    languesNuchabal: () => {
      return Object.keys(infoLangues);
    },
    ...mapGetters({
      systèmeNumération: "paramètres/systèmeNumération",
    }),
  },
  methods: {
    nomDeLangue,
    chiffreÀTexte,
    texteÀChiffre,
    droiteÀGauche: function (langue) {
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
    clefsMessages: function (lng) {
      lng = lng || this.langueOriginale
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
      return extraireMessages(messages[lng])
    },
    progrès: function (lng) {
      const messages = this.$i18n.messages;
      const messagesOrig = this.clefsMessages(this.langueOriginale);
      const messagesLng = new Set(
        messages[lng] ? this.clefsMessages(lng) : []
      );
      const communs = messagesOrig.filter((c) => messagesLng.has(c));
      return communs.length / messagesOrig.length;
    },
    traduireClef: function (clef, langues) {
      const clefs = clef.split(".")
      const trouverTrad = (listeClefs, dicTrads) => {
        const [première, ...toutLeReste] = listeClefs;
        const prochain = dicTrads[première]
        if (!toutLeReste.length) {
          return typeof prochain === "string" ? prochain : undefined;
        } else if (typeof prochain !== "object" ) {
          return undefined
        } else {
          return trouverTrad(toutLeReste, prochain)
        }
      }
      for (const langue of langues) {
        const dicLangue = this.$i18n.messages[langue]
        const trad = trouverTrad(clefs, dicLangue)
        if (trad) return trad
      }
    },
    changerNumération: function (système) {
      this.$store.commit("paramètres/changerNumération", { système: système });
    },
    formatterChiffre: function (n) {
      return chiffreÀTexte(n, this.systèmeNumération);
    },
    formatterDate: function (val) {
      return new Date(val).toLocaleDateString(this.$i18n.locale);
    },
  },
};
