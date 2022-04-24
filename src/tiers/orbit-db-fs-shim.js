/* eslint-disable */
const oùSommesNous = require('wherearewe')

const fs = (!oùSommesNous.isElectronMain && (typeof window === 'object' || typeof self === 'object')) ? null : eval('require("fs")')

module.exports = fs
