import  GestionnaireClient from "./gestionnaireClient";
import {
  MessageDeTravailleur,
  MessageErreurDeTravailleur,
} from "./ipaParallèle";

const fMessage = (message: MessageDeTravailleur) => postMessage(message)

const fErreur = (erreur: Error) => {
  const messageErreur: MessageErreurDeTravailleur = {
    type: "erreur",
    erreur
  }
  postMessage(messageErreur)
}

const client = new GestionnaireClient(
  fMessage,
  fErreur
)

onmessage = async function ({ data }) {
  console.log("Message reçu par le travailleur", data);
  client.gérerMessage(data)
};
