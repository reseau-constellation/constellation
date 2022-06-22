
export function générerLien(
  contact: string | number,
  invitation: {
    idCompte: string;
    codeSecret: string;
  },
  type: "sms" | "courriel" | "whatsapp" | "simple"
): string {
  contact = contact.toString();

  const message = {
    type: "ajout dispositif",
    info: invitation
  }
  const messageEncodé = encodeURIComponent(JSON.stringify(message));
  const lienFinal = `constellation://${messageEncodé}`;

  const sujet = "Lien ajout dispositif compte Constellation";
  const messageFinal = `Cliquez sur le lien ci-dessous pour finaliser l'ajout du dispositif. Ne cliquez que si ce message provient de vous-même !\n${lienFinal}`;

  switch (type) {
    case "sms":
      return `sms:${contact}?&body=${encodeURIComponent(messageFinal)}`;

    case "whatsapp":
      return `whatsapp://send?phone=${contact}&text=${messageFinal}`

    case "courriel":
      return `mailto:${contact}?subject=${sujet}&body=${encodeURIComponent(messageFinal)}`

    case "simple":
      return lienFinal

    default:
      throw `Type de lien ${type} inconnu.`;
  }
}


""
