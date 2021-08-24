import { once } from "events";
import { Store, KeyValueStore, FeedStore } from "orbit-db";
import ContrôleurConstellation from "../accès/contrôleurConstellation";

export const attendreSync = async (bd: Store): Promise<void> => {
  const accès: ContrôleurConstellation = bd.access
  await once(accès.bd!.events, "peer.exchanged");
}

export const peutÉcrire = async (
  bd: KeyValueStore | FeedStore,
  attendreRéplication = false
): Promise<boolean> => {
  if (attendreRéplication) {
    await attendreSync(bd);
  };

  try {
    if (bd.type === "keyvalue") {
      const CLEF = "test";
      const VAL = 123;

      await (bd as KeyValueStore).set(CLEF, VAL);
      const val = await bd.get(CLEF);

      await (bd as KeyValueStore).del(CLEF);
      return val === VAL;
    } else if (bd.type === "feed") {
      const VAL = "test";

      await (bd as FeedStore).add(VAL);
      const éléments = (bd as FeedStore).iterator({ limit: -1 }).collect();

      const autorisé =
        éléments.length === 1 && éléments[0].payload.value === VAL;
      if (éléments.length === 1)
        await (bd as FeedStore).remove(éléments[0].hash);
      return autorisé;
    } else {
      throw new Error(`Type de BD ${bd.type} non supporté par ce test.`);
    }
  } catch {
    return false;
  }
};

export const fermerBd = async (bd: Store) => {
  await bd.close();
  await bd.access.close();
};
