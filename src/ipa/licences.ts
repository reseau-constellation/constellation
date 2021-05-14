const conditions = {
  ATTR: "attribution",
  ÉGAL: "partageÉgal",
  OUVT: "ouverture"
};

const droits = {
  PRTG: "partager",
  CRR: "créer",
  ADPT: "adapter"
};

const types = {
  BD: "basesDeDonnées",
  ART: "artistique",
  CODE: "codeInformatique"
};

export const infoLicences = {
  "ODbl-1_0": {
    conditions: [conditions.ATTR, conditions.ÉGAL, conditions.OUVT],
    droits: [droits.PRTG, droits.CRR, droits.ADPT],
    type: types.BD
  },
  "ODC-BY-1_0": {
    conditions: [conditions.ATTR],
    droits: [droits.PRTG, droits.CRR, droits.ADPT],
    type: types.BD
  },
  PDDL: {
    conditions: [],
    droits: [droits.PRTG, droits.CRR, droits.ADPT],
    type: types.BD
  },

  "CC-BY-SA-4_0": {
    conditions: [conditions.ATTR, conditions.PRTGL, conditions.OUVT],
    droits: [droits.PRTG, droits.ADPT],
    type: types.ART
  },
  "CC-BY-4_0": {
    conditions: [conditions.ATTR],
    droits: [droits.PRTG, droits.ADPT],
    type: types.ART
  },
  "CC-0-1_0": {
    conditions: [],
    droits: [droits.PRTG, droits.ADPT],
    type: types.ART
  },

  "agpl-3_0": {
    conditions: [conditions.RESP, conditions.GRNT],
    droits: [droits.CMRC, droits.DIST, droits.MOD, droits.BREV],
    type: types.CODE
  },
  "gpl-3_0": {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  "GNU-LGPLv3": {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  "MPL-v2": {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  "Apache-v2": {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  MIT: {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  "Boost-v1": {
    conditions: [],
    droits: [],
    type: types.CODE
  },
  "Domaine-Publique": {
    conditions: [],
    droits: [],
    type: types.CODE
  }
};

export const licences = Object.keys(infoLicences);
