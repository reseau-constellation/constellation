import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import conditions from "./conditions";
import paramètres from "./paramètres";

Vue.use(Vuex);

const vuexLocal = new VuexPersistence<RootState>()

export default new Vuex.Store<State>({
  modules: { conditions, paramètres },
  plugins: [vuexLocal.plugin]
});
