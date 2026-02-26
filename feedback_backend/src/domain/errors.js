export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class PolicyNotFoundError extends DomainError {
  constructor(message = "Active compiled policy not found") {
    super(message);
    this.name = "PolicyNotFoundError";
  }
}

export class LlmError extends DomainError {
  constructor(message) {
    super(message);
    this.name = "LlmError";
  }
}

