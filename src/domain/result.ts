export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
