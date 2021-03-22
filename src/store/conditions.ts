export default {
  namespaced: true,
  state: {
    acceptées: false,
  },
  mutations: {
    accepterConditions (state, payload) {
      state.acceptées = Boolean(payload.acceptées)
    }
  },
  actions: {},
  modules: {}
}
