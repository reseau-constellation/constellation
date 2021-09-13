# Constellation
![Logo Constellation](https://raw.githubusercontent.com/julienmalard/constellation/master/src/assets/logo.png)  
[![Électron](https://github.com/julienmalard/constellation/actions/workflows/electron.yml/badge.svg)](https://github.com/julienmalard/constellation/actions/workflows/electron.yml)
[![Apli Internet](https://github.com/julienmalard/constellation/actions/workflows/gh-pages-deploy.yml/badge.svg)](https://github.com/julienmalard/constellation/actions/workflows/gh-pages-deploy.yml)
[![Couverture](https://codecov.io/gh/reseau-constellation/constellation/branch/master/graph/badge.svg?token=c8BPlMOwzM)](https://codecov.io/gh/reseau-constellation/constellation)


## Installation

## Développement
Nous utilisons `Électron` afin de générer et l'application Internet,
et le logiciel installable à base d'un seul projet de code.

### Compilation en mode développement
Pour développer en mode Internet, utilisez:
```
yarn serve
```

Pour développer en mode Électron, utilisez:
```
yarn electron:serve
```

### Compilation en mode production
Pour compiler en mode production Internet, utilisez:
```
yarn build
```

Pour compiler en mode production Électron, utilisez:
```
yarn electron:build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
