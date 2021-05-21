export default {
  namespaced: true,
  state: {
    acceptées: false,
  },
  mutations: {
    accepterConditions(state: any, payload: { acceptées: boolean }) {
      state.acceptées = Boolean(payload.acceptées);
    },
  },
  actions: {},
  modules: {},
};
