import { rajilanïkChabäl as numLangue } from "nuchabal";

export default {
  namespaced: true,
  state: {
    langue: null,
    numération: null,
    thèmeImages: "unDraw",
    thèmeNuit: false
  },
  mutations: {
    changerNumération(state: any, payload: { système: string }) {
      state.numération = payload.système;
    },
    changerThèmeImage(state: any, payload: { thème: string }) {
      state.thèmeImages = payload.thème;
    },
    changerLangue(state: any, payload: { langue: string }) {
      state.langue = payload.langue;
    },
    changerThèmeNuit(state: any, payload: { val: string }) {
      state.thèmeNuit = payload.val;
    }
  },
  actions: {},
  getters: {
    systèmeNumération: (state: any) => {
      const num = state.numération;
      return num === null ? numLangue(state.langue) || "latin" : num;
    }
  },
  modules: {}
};
