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
