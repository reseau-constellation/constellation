import { rajilanïkChabäl as numLangue } from "nuchabal";
import { முறைமைகள் as systèmesNum } from "ennikkai"

const state = {
  langue: null as null | string,
  numération: null as null | string,
  thèmeImages: "unDraw",
  thèmeNuit: false,
};

export default {
  namespaced: true,
  state,
  mutations: {
    changerNumération(
      _state: typeof state,
      payload: { système: string }
    ): void {
      _state.numération = payload.système;
    },
    changerThèmeImage(_state: typeof state, payload: { thème: string }): void {
      _state.thèmeImages = payload.thème;
    },
    changerLangue(_state: typeof state, payload: { langue: string }): void {
      _state.langue = payload.langue;
    },
    changerThèmeNuit(_state: typeof state, payload: { val: boolean }): void {
      _state.thèmeNuit = payload.val;
    },
  },
  actions: {},
  getters: {
    choixNumération: (_state: typeof state): string | null => {
      return _state.numération;
    },
    systèmeNumération: (_state: typeof state): string => {
      const num = _state.numération;
      if (num === null) {
        return numLangue(_state.langue) || (systèmesNum.includes(_state.langue) ? _state.langue! : "latin")
      }
      return num;
    },
  },
  modules: {},
};
