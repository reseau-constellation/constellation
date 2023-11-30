"use strict";(self["webpackChunkconstellation"]=self["webpackChunkconstellation"]||[]).push([[437],{50311:function(t,e,i){i.a(t,(async function(t){i(57658);var s=i(40326),n=i(69698),r=i(54272),a=i(41324),o=i(60724),c=i(89576),l=i(13128),u=i(54105),d=i(4497),f=i(93102),h=t([f,c]);[f,c]=h.then?await h:h,e["Z"]=(0,s.Z)(d.Z,f.Z).extend({name:"carteBD",props:{bd:String},components:{lienOrbite:r.Z,dialogueEffacer:a.Z,"texteTronqué":o.Z,dialogueLicence:c.Z,"dialogueQualité":l.Z,dialogueEpingler:u.Z},mixins:[d.Z,f.Z],data:function(){return{noms:{},dialogueEffacerBd:!1,"épinglée":void 0,licence:null,logo:null,score:null,"permissionÉcrire":!1,nomsBD:{},"détailsBD":{},variables:[]}},computed:{idBd:function(){return decodeURIComponent(this.bd)},idAuteur:function(){var t;return null===(t=this.auteurs.filter((t=>t.accepté))[0])||void 0===t?void 0:t.idBdCompte},langues:function(){return[this.$i18n.locale,...this.$i18n.fallbackLocale]},nom:function(){return Object.keys(this.nomsBD).length?(0,n.BK)(this.nomsBD,this.langues):this.idBd},"détails":function(){return(0,n.BK)(this.détailsBD,this.langues)}},methods:{couleurScore:n.XZ,changerLicence({licence:t}){this.$ipa.bds.changerLicenceBd({idBd:this.idBd,licence:t})},effacerBd:async function(){await this.$ipa.bds.effacerBd({id:this.idBd}),this.$router.push("/bd")},initialiserSuivi:async function(){const t=await this.$ipa.suivrePermissionÉcrire({id:this.idBd,f:t=>this.permissionÉcrire=t}),e=await this.$ipa.bds.suivreImage({idBd:this.idBd,f:t=>{if(t){const e=URL.createObjectURL(new Blob([t.buffer],{type:"image"}));this.logo=e}else this.logo=null}}),i=await this.$ipa.bds.suivreLicence({id:this.idBd,f:t=>{this.licence=t}}),s=await this.$ipa.bds.suivreNomsBd({id:this.idBd,f:t=>{this.nomsBD=t}}),n=await this.$ipa.bds.suivreDescrBd({id:this.idBd,f:t=>{this.détailsBD=t}}),r=await this.$ipa.bds.suivreScoreBd({id:this.idBd,f:t=>this.score=t}),a=await this.$ipa.favoris.suivreEstÉpingléSurDispositif({idObjet:this.idBd,f:t=>{this.épinglée=t}});this.suivre([t,e,i,s,n,r,a])}}})}))},73929:function(t,e,i){i.a(t,(async function(t){var s=i(40326),n=i(4497),r=i(23023),a=t([r]);r=(a.then?await a:a)[0],e["Z"]=(0,s.Z)(n.Z).extend({name:"résultatsRecherchePersonnes",mixins:[n.Z],components:{carteBd:r.Z},data:function(){return{bds:[]}},methods:{initialiserSuivi:async function(){const{fOublier:t}=await this.$ipa.réseau.rechercherBds({f:t=>this.bds=t,"nRésultatsDésirés":5});this.suivre([t])}}})}))},22570:function(t,e,i){i.a(t,(async function(t){var s=i(20144),n=i(43720),r=i(45187),a=i(46954),o=i(97840),c=t([a]);a=(c.then?await c:c)[0],e["Z"]=s.ZP.extend({name:"PageRecherche",components:{Titre:n.Z,"résultatsRecherchePersonnes":r.Z,"résultatsRechercheBds":a.Z},mixins:[o.Z],data:function(){return{"catégorie":"bds"}}})}))},23023:function(t,e,i){i.a(t,(async function(t){var s=i(1840),n=i(12965),r=i(43736),a=t([n]);n=(a.then?await a:a)[0];var o=(0,r.Z)(n.Z,s.s,s.x,!1,null,null,null);e["Z"]=o.exports}))},43720:function(t,e,i){i.d(e,{Z:function(){return m}});var s=i(85526),n=i(56653),r=i(55051),a=i(69096),o=function(){var t=this,e=t._self._c;t._self._setupProxy;return e(a.Z,{staticClass:"mt-3 text-center"},[e(n.Z,[e("h1",{staticClass:"display-2 font-weight-bold"},[t._v(" "+t._s(t.entête)+" ")])]),t.image?e(n.Z,{attrs:{cols:"12"}},[t.imageRonde?e(s.Z,{staticClass:"mb-3",attrs:{size:"175"}},[e(r.Z,{attrs:{src:t.image}})],1):e(r.Z,{staticClass:"mb-3",attrs:{src:t.image,contain:"",height:"175"}})],1):t._e(),t.soustitre?e(n.Z,{attrs:{cols:"12"}},[e("h2",{staticClass:"headline font-weight-bold mb-5"},[t._v(" "+t._s(t.soustitre)+" ")])]):t._e()],1)},c=[],l=i(20144),u=l.ZP.extend({name:"TitrePage",props:["entête","soustitre","image","imageRonde"]}),d=u,f=i(43736),h=(0,f.Z)(d,o,c,!1,null,null,null),m=h.exports},46954:function(t,e,i){i.a(t,(async function(t){var s=i(4987),n=i(58402),r=i(43736),a=t([n]);n=(a.then?await a:a)[0];var o=(0,r.Z)(n.Z,s.s,s.x,!1,null,null,null);e["Z"]=o.exports}))},45187:function(t,e,i){i.d(e,{Z:function(){return q}});var s=i(56653),n=i(7933),r=function(){var t=this,e=t._self._c;t._self._setupProxy;return e(s.Z,{attrs:{cols:"12"}},[e(n.Qn,{staticClass:"d-flex flex-wrap justify-center",attrs:{group:""}},t._l(t.membres,(function(t){return e("carte-membre",{key:t.id,attrs:{id:t.id,vuIlyA:t.vuIlyA}})})),1)],1)},a=[],o=i(40326),c=i(4497),l=i(6348),u=i(35173),d=i(86283),f=i(69165),h=i(70060),m=i(7186),p=i(7656),v=i(80675),b=i(52275),Z=i(88084),_=i(62067),g=function(){var t=this,e=t._self._c;t._self._setupProxy;return e(h.Z,{attrs:{scrollable:"","max-width":"700"},scopedSlots:t._u([{key:"activator",fn:function({on:i,attrs:s}){return[t._t("activator",null,null,{on:i,attrs:s}),e(l.Z,t._g(t._b({attrs:{height:"75",width:"1100",text:""}},"v-btn",s,!1),i),[e("div",{staticClass:"text-left"},[e("avatar-profil",{attrs:{id:t.id,vuIlyA:t.vuIlyA}}),e("texteTronqué",{attrs:{texte:t.nom,longueurMax:30}})],1),e(_.Z),e("lien-orbite",{attrs:{lien:t.id}})],1)]}}],null,!0),model:{value:t.dialogue,callback:function(e){t.dialogue=e},expression:"dialogue"}},[e(u.Z,{staticClass:"text-h5 grey lighten-2"},[e(d.EB,[t._v(" "+t._s(t.$t("carteMembre.முகவரி"))+" "),e(_.Z),e(l.Z,{attrs:{icon:""},on:{click:function(e){t.dialogue=!1}}},[e(p.Z,[t._v("mdi-close")])],1)],1),e(m.Z),e(d.h7,[e(d.ZB,{staticClass:"text-left"},[e(Z.Z,{attrs:{column:"",scrollable:""},model:{value:t.dialogue,callback:function(e){t.dialogue=e},expression:"dialogue"}},[t.courriel?e("span",[e("p",{staticClass:"mb-0 text-overline"},[t._v(" "+t._s(t.$t("carteMembre.தொடர்பு"))+" ")]),e(f.Z,{attrs:{label:"",outlined:"",small:""}},[e(p.Z,{attrs:{left:"",small:""}},[t._v("mdi-email")]),e("texteTronqué",{attrs:{texte:t.courriel,longueurMax:50}})],1)],1):t._e(),e("p",{staticClass:"mb-0 text-overline"},[t._v(" "+t._s(t.$t("carteMembre.தரவு"))+" ")]),t._l(t.bds.slice(0,t.N_MAX_LISTE),(function(t){return e("jeton-bd",{key:t,attrs:{id:t}})})),t.bds.length>t.N_MAX_LISTE?e(v.Z,{staticClass:"me-1 mb-1"},[t._v(" "+t._s(t.$t("carteMembre.bdsExtra",{n:t.formatterChiffre(t.bds.length-t.N_MAX_LISTE)}))+" ")]):t._e(),t.bds.length?t._e():e(b.Z,{attrs:{label:"",outlined:"",small:"",disabled:""}},[t._v(" "+t._s(t.$t("carteMembre.aucuneBd"))+" ")]),e("p",{staticClass:"mb-0 text-overline"},[t._v(" "+t._s(t.$t("carteMembre.திட்டங்கள்"))+" ")]),t._l(t.projets,(function(t){return e("jeton-bd",{key:t,attrs:{id:t}})})),t.projets.length?t._e():e(f.Z,{attrs:{label:"",outlined:"",small:"",disabled:""}},[t._v(" "+t._s(t.$t("carteMembre.Aucunprojet"))+" ")])],2)],1)],1)],1)],1)},x=[],B=i(69698),y=i(60724),$=i(54272),w=(i(57658),function(){var t=this,e=t._self._c;t._self._setupProxy;return e(f.Z,{staticClass:"me-1 mb-1",attrs:{label:"",outlined:"",small:""},on:{click:function(e){t.$router.push(`/bd/visualiser/${encodeURIComponent(t.id)}`)}}},[e(p.Z,{attrs:{left:"",small:""}},[t._v("mdi-database-outline")]),e("texteTronqué",{attrs:{texte:t.nom,longueurMax:15}})],1)}),k=[],C=i(71378),M=(0,o.Z)(C.Z,c.Z).extend({name:"jetonBd",props:["id"],mixins:[C.Z,c.Z],components:{"texteTronqué":y.Z},data:function(){return{noms:{},"catégorie":void 0}},computed:{nom:function(){return Object.keys(this.noms).length?(0,B.BK)(this.noms,this.languesPréférées):this.id}},methods:{initialiserSuivi:async function(){const t=await this.$ipa.bds.suivreNomsBd({id:this.id,f:t=>{this.noms=t}});this.suivre([t])}}}),j=M,P=i(43736),R=(0,P.Z)(j,w,k,!1,null,null,null),S=R.exports,D=i(89983),I=(0,o.Z)(c.Z,C.Z).extend({name:"carteMembre",props:["id","vuIlyA"],mixins:[C.Z,c.Z],components:{lienOrbite:$.Z,jetonBd:S,avatarProfil:D.Z,"texteTronqué":y.Z},data:function(){return{noms:{},dialogue:!1,courriel:void 0,bds:[],projets:[],monIdBdRacine:void 0,N_MAX_LISTE:4}},computed:{nom:function(){return Object.keys(this.noms).length?(0,B.BK)(this.noms,this.languesPréférées):this.$t("traduction.மறைமுகம்")},"moiMême":function(){return this.id===this.monIdBdRacine},actif:function(){return Boolean(Object.keys(this.noms).length||this.courriel||this.bds.length||this.projets.length)}},methods:{initialiserSuivi:async function(){const t=await this.$ipa.suivreIdBdCompte({f:t=>this.monIdBdRacine=t}),e=await this.$ipa.réseau.suivreNomsMembre({idCompte:this.id,f:t=>{this.noms=t}}),i=await this.$ipa.réseau.suivreCourrielMembre({idCompte:this.id,f:t=>{this.courriel=t}}),s=await this.$ipa.réseau.suivreBdsMembre({idCompte:this.id,f:t=>{this.bds=t||[]}}),n=await this.$ipa.réseau.suivreProjetsMembre({idCompte:this.id,f:t=>{this.projets=t||[]}});this.suivre([t,e,i,s,n])}}}),E=I,L=(0,P.Z)(E,g,x,!1,null,null,null),A=L.exports,T=(0,o.Z)(c.Z).extend({name:"résultatsRecherchePersonnes",mixins:[c.Z],components:{carteMembre:A},data:function(){return{membres:[]}},methods:{initialiserSuivi:async function(){const{fOublier:t}=await this.$ipa.réseau.rechercherMembres({f:t=>{this.membres=t},"nRésultatsDésirés":5});this.suivre([t])}}}),O=T,N=(0,P.Z)(O,r,a,!1,null,null,null),q=N.exports},46538:function(t,e,i){i.a(t,(async function(t){i.r(e);var s=i(3971),n=i(20151),r=i(43736),a=t([n]);n=(a.then?await a:a)[0];var o=(0,r.Z)(n.Z,s.s,s.x,!1,null,null,null);e["default"]=o.exports}))},12965:function(t,e,i){i.a(t,(async function(t){var s=i(50311),n=t([s]);s=(n.then?await n:n)[0],e["Z"]=s.Z}))},58402:function(t,e,i){i.a(t,(async function(t){var s=i(73929),n=t([s]);s=(n.then?await n:n)[0],e["Z"]=s.Z}))},20151:function(t,e,i){i.a(t,(async function(t){var s=i(22570),n=t([s]);s=(n.then?await n:n)[0],e["Z"]=s.Z}))},3971:function(t,e,i){i.d(e,{s:function(){return o},x:function(){return c}});var s=i(71e3),n=i(70071),r=i(88084),a=i(16498),o=function(){var t=this,e=t._self._c;t._self._setupProxy;return e(s.Z,{staticClass:"text-center justify-center"},[e("titre",{attrs:{"entête":t.$t("recherche.entête"),image:t.image("recherche"),soustitre:t.$t("recherche.soustitre")}}),e(a.Z,{staticClass:"mx-10 mt-0",attrs:{outlined:""}}),e(r.Z,{attrs:{row:""},model:{value:t.catégorie,callback:function(e){t.catégorie=e},expression:"catégorie"}},[e(n.Z,{attrs:{label:t.$t("recherche.Bases"),value:"bds"}}),e(n.Z,{attrs:{label:t.$t("recherche.Projets"),value:"projets"}}),e(n.Z,{attrs:{label:t.$t("recherche.Personnes"),value:"personnes"}})],1),"personnes"===t.catégorie?e("résultatsRecherchePersonnes"):"bds"===t.catégorie?e("résultatsRechercheBds"):t._e()],1)},c=[]},1840:function(t,e,i){i.d(e,{s:function(){return b},x:function(){return Z}});var s=i(6348),n=i(35173),r=i(86283),a=i(69165),o=i(70060),c=i(7186),l=i(7656),u=i(55051),d=i(52275),f=i(4140),h=i(71582),m=i(88084),p=i(62067),v=i(18043),b=function(){var t=this,e=t._self._c;t._self._setupProxy;return e(d.Z,t._g(t._b({on:{click:function(e){return t.$emit("click")}}},"v-list-item",t.$attrs,!1),t.$தகவல்கள்),[e("div",{staticClass:"text-left"},[e(d.Z,[e(h.Z,[e(u.Z,{attrs:{src:t.logo||i(55995),height:"25px",contain:""}})],1),e(f.km,[e(f.V9,[e("texteTronqué",{attrs:{texte:t.nom,longueurMax:30}})],1),e(f.oZ,[t._v(" "+t._s(t.détails)+" ")])],1)],1)],1),e(p.Z),e(f.k4,[e(m.Z,{attrs:{row:""},model:{value:t.catégorie,callback:function(e){t.catégorie=e},expression:"catégorie"}},[e("dialogue-licence",{attrs:{idLicence:t.licence,permissionModifier:t.permissionÉcrire},on:{changerLicence:t.changerLicence},scopedSlots:t._u([{key:"activator",fn:function({on:i,attrs:s}){return[e(a.Z,t._g(t._b({staticClass:"me-1 my-1",attrs:{outlined:"",label:"",small:""}},"v-chip",s,!1),i),[e(l.Z,{attrs:{left:"",small:"",color:t.licenceApprouvée?"secondary":"error"}},[t._v(" "+t._s(t.licence?"mdi-scale-balance":"mdi-alert-outline")+" ")]),t._v(" "+t._s(t.licence&&!t.licenceApprouvée?t.licence:t.$t(`licences.info.${t.licence||"introuvable"}.abr`))+" ")],1),e(p.Z),e(h.Z,[e("lien-orbite",{attrs:{lien:t.idBd}})],1)]}}])})],1)],1),e(f.k4,[e("dialogue-epingler",{attrs:{id:t.idBd,optionFichiers:!1},scopedSlots:t._u([{key:"activator",fn:function({on:i,attrs:n}){return[e(v.Z,t._g(t._b({attrs:{"open-delay":"200",bottom:""},scopedSlots:t._u([{key:"activator",fn:function({on:r,attrs:a}){return[e("span",t._g(t._b({},"span",a,!1),r),[e(s.Z,t._g(t._b({attrs:{icon:""}},"v-btn",n,!1),i),[e(l.Z,[t._v(t._s(t.épinglé&&t.épinglé.bd?"mdi-pin":"mdi-pin-outline"))])],1)],1)]}}],null,!0)},"v-tooltip",n,!1),i),[e("span",[t._v(t._s(t.$t(t.épinglé&&t.épinglé.bd?"carteBD.indiceÉpinglé":"carteBD.indiceNonÉpinglé")))])])]}}])})],1),e(f.k4,[t.permissionÉcrire?e(o.Z,{attrs:{width:"500"},scopedSlots:t._u([{key:"activator",fn:function({on:i,attrs:n}){return[e(v.Z,{attrs:{"open-delay":"200",bottom:""},scopedSlots:t._u([{key:"activator",fn:function({on:r,attrs:a}){return[e("span",t._g(t._b({},"span",a,!1),r),[e(s.Z,t._g(t._b({attrs:{icon:"",color:"error"}},"v-btn",n,!1),i),[e(l.Z,[t._v("mdi-delete")])],1)],1)]}}],null,!0)},[e("span",[t._v(t._s(t.$t("bd.vis.indiceEffacer")))])])]}}],null,!1,1879917989),model:{value:t.dialogueEffacerBd,callback:function(e){t.dialogueEffacerBd=e},expression:"dialogueEffacerBd"}},[e(n.Z,[e(r.EB,{staticClass:"headline red--text"},[t._v(" "+t._s(t.$t("bd.visBD.நீக்கம்"))+" ")]),e(r.ZB,[t._v(" "+t._s(t.$t("bd.visBD.தரவுத்தளம்_அகற்றல்"))+" ")]),e(c.Z),e(r.h7,[e(p.Z),e(s.Z,{attrs:{color:"error",text:"",outlined:""},on:{click:function(e){t.dialogueEffacerBd=!1}}},[t._v(" "+t._s(t.$t("bd.visBD.இல்லை"))+" ")]),e(s.Z,{attrs:{color:"error",depressed:""},on:{click:t.effacerBd}},[t._v(" "+t._s(t.$t("bd.visBD.நீக்கவும்"))+" ")])],1)],1)],1):t._e()],1)],1)},Z=[]},4987:function(t,e,i){i.d(e,{s:function(){return r},x:function(){return a}});var s=i(56653),n=i(7933),r=(i(57658),function(){var t=this,e=t._self._c;t._self._setupProxy;return e(s.Z,{attrs:{cols:"12"}},[e(n.Qn,{staticClass:"d-flex flex-wrap justify-center",attrs:{group:""}},t._l(t.bds,(function(i){return e("carte-bd",{key:i.id,attrs:{bd:i.id},on:{click:function(e){t.$router.push(`/bd/visualiser/${encodeURIComponent(i.id)}`)}}})})),1)],1)}),a=[]}}]);