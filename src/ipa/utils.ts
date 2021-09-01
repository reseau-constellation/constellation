import { CID } from "multiformats/cid";

export function itérateurÀFlux(
  itérable: AsyncIterable<Uint8Array>
): ReadableStream<Uint8Array> {
  const itérateur = itérable[Symbol.asyncIterator]();

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await itérateur.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}


export function CIDvalid(cid: unknown): boolean {
  if (typeof cid === "string") {
    try {
      CID.parse(cid);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
