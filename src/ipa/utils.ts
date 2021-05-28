export function itérateurÀFlux<T>(itérateur: Iterator<T>): ReadableStream<T> {
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
