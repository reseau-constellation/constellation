# Constellation
<p align="center">
  <a href="https://codecov.io/gh/reseau-constellation/constellation" > 
    <img src="https://codecov.io/gh/reseau-constellation/constellation/branch/master/graph/badge.svg?token=c8BPlMOwzM"/> 
  </a>
</p>
![Logo Constellation](https://raw.githubusercontent.com/julienmalard/constellation/master/src/assets/logo.png)  
[![Apli Mac & Linux](https://github.com/julienmalard/constellation/actions/workflows/electron.yml/badge.svg)](https://github.com/julienmalard/constellation/actions/workflows/electron.yml)
[![Apli Windows](https://ci.appveyor.com/api/projects/status/6rl7m3eroj219fqb?svg=true)](https://ci.appveyor.com/project/julienmalard/constellation)
[![Apli Internet](https://github.com/julienmalard/constellation/actions/workflows/gh-pages-deploy.yml/badge.svg)](https://github.com/julienmalard/constellation/actions/workflows/gh-pages-deploy.yml)

Un réseau distribué et ouvert pour le partage des bases de données scientifiques.

## Installation
Vous pouvez utiliser Constellation ou bien en tant qu'[appli Internet](https://réseau-constellation.ca), ou bien en tant qu'[application installable](https://github.com/reseau-constellation/constellation/releases).
> Note d'installation importante pour MacOS: voir [ici](https://www.cnet.com/tech/computing/how-to-install-unidentified-app-on-a-macbook/)

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
