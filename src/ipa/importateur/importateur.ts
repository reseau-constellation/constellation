export abstract class Importateur {
  abstract tableaux: () => Promise<string[]>;
}
