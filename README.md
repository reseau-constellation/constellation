# Constellation
![Logo Constellation](https://raw.githubusercontent.com/julienmalard/constellation/master/src/assets/logo.png)

## Installation

### Installation du client
```
npm install constallation -g
```

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

### Publication du site internet
```
yarn deploy
```

### Exécution des tests d'unité
```
yarn test:unit
```

### Exécution des tests complets
```
yarn test:e2e
```

### Pour reformatter le code
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
