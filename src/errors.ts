export class ConcurrentParsingNotSupportedError extends Error {
  constructor() {
    super(
      "A parse operation is already in progress. Concurrent parsing is not supported on the same instance.",
    );
    this.name = "ConcurrentParsingNotSupportedError";
    Object.setPrototypeOf(this, ConcurrentParsingNotSupportedError.prototype);
  }
}
