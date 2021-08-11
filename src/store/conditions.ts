const state = {
  acceptées: false,
};

export default {
  namespaced: true,
  state,
  mutations: {
    accepterConditions(
      _state: typeof state,
      payload: { acceptées: boolean }
    ): void {
      _state.acceptées = Boolean(payload.acceptées);
    },
  },
  actions: {},
  modules: {},
};
