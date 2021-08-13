export function itérateurÀFlux(
  itérateur: AsyncIterator<Uint8Array>
): ReadableStream<Uint8Array> {
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
