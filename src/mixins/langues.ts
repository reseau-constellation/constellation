import Vue from "vue";
import { LocaleMessageObject, Locale } from "vue-i18n";
import { uniq } from "lodash";

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

export default Vue.extend({
  data() {
    return {
      langueOriginale: ORIG as string,
    };
  },
  computed: {
    langue: function (): string {
      return this.$i18n.locale;
    },
    languesPréférées: function (): string[] {
      return uniq([this.$i18n.locale, ...(this.$i18n.fallbackLocale as Locale[])]);
    },
    écriture: function (): string {
      return écriture(this.langue);
    },
    langues: function (): string[] {
      const liste_langues = [
        ...new Set([
          ...Object.keys(infoLangues),
          ...Object.keys(this.$i18n.messages),
        ]),
      ];
      return liste_langues.sort((a, b) => {
        return b === this.langueOriginale
          ? 1
          : this.progrès(a) < this.progrès(b)
          ? 1
          : -1;
      });
    },
    languesNuchabal: (): string[] => {
      return Object.keys(infoLangues);
    },
    ...mapGetters({
      systèmeNumération: "paramètres/systèmeNumération",
      choixNumération: "paramètres/choixNumération",
    }),
  },
  methods: {
    nomDeLangue,
    chiffreÀTexte,
    texteÀChiffre,
    droiteÀGauche(langue: string): boolean {
      const orientation = orientationÉcriture(écriture(langue));
      return Boolean(orientation && orientation.includes("←"));
    },
    changerLangue(lng: string) {
      this.$i18n.fallbackLocale = [this.$i18n.locale, "fr"];
      this.$vuetify.lang.current = codeLangue(nomDeLangue(lng), "iso");
      this.$i18n.locale = lng;
      this.$vuetify.rtl = this.droiteÀGauche(lng);
      this.$store.commit("paramètres/changerLangue", { langue: lng });
    },
    clefsMessages(lng?: string): string[] {
      lng = lng || this.langueOriginale;
      const messages = this.$i18n.messages;
      const extraireMessages = (
        d: LocaleMessageObject,
        préc?: string
      ): string[] => {
        let msgs: string[] = [];
        for (const [c, v] of Object.entries(d)) {
          const clef = préc ? `${préc}.${c}` : c;
          if (typeof v === "string") {
            msgs.push(clef);
          } else {
            msgs = [
              ...msgs,
              ...extraireMessages(v as LocaleMessageObject, clef),
            ];
          }
        }
        return msgs;
      };
      return extraireMessages(messages[lng]);
    },
    progrès(lng: string): number {
      const messages = this.$i18n.messages;
      const messagesOrig = this.clefsMessages(this.langueOriginale);
      const messagesLng = new Set(messages[lng] ? this.clefsMessages(lng) : []);
      const communs = messagesOrig.filter((c) => messagesLng.has(c));
      return communs.length / messagesOrig.length;
    },
    traduireClef(
      clef: string,
      langues: Locale[]
    ): { trad: string; langue: string } | undefined {
      const clefs = clef.split(".");
      const trouverTrad = (
        listeClefs: string[],
        dicTrads: LocaleMessageObject
      ): string | undefined => {
        const [première, ...toutLeReste] = listeClefs;
        const prochain = dicTrads[première];
        if (!toutLeReste.length) {
          return typeof prochain === "string" ? prochain : undefined;
        } else if (typeof prochain !== "object") {
          return undefined;
        } else {
          return trouverTrad(toutLeReste, prochain as LocaleMessageObject);
        }
      };
      for (const langue of langues) {
        const dicLangue = this.$i18n.messages[langue];
        if (dicLangue) {
          const trad = trouverTrad(clefs, dicLangue);
          if (trad) return { trad, langue };
        }
      }
    },
    changerNumération: function (système: string) {
      this.$store.commit("paramètres/changerNumération", { système: système });
    },
    formatterChiffre: function (n: number) {
      return chiffreÀTexte(n, this.systèmeNumération);
    },
    formatterDate: function (val: number) {
      return new Date(val).toLocaleDateString(this.$i18n.locale);
    },
    formatterHeure: function (val: number) {
      return new Date(val).toLocaleDateString(this.$i18n.locale);
    },
    formatterHorodatage: function (val: number) {
      // console.log(new Intl.DateTimeFormat("ta", {calendar: "indian", numberingSystem: "tamldec"}).format(date));
      return new Date(val).toLocaleDateString(this.$i18n.locale);
    },
  },
});
