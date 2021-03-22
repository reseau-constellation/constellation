export default {
  namespaced: true,
  state: {
    langue: null,
    numération: null,
    thèmeImages: 'unDraw',
    thèmeNuit: false
  },
  mutations: {
    changerNumération (state, payload) {
      state.numération = payload.système
    },
    changerThèmeImage (state, payload) {
      state.thèmeImages = payload.thème
    },
    changerLangue (state, payload) {
      state.langue = payload.langue
    },
    changerThèmeNuit (state, payload) {
      state.thèmeNuit = payload.val
    }
  },
  actions: {},
  modules: {}
}
