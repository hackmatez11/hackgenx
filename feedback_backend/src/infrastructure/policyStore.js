export class InMemoryPolicyStore {
  constructor() {
    this.policies = [];
  }

  async savePolicy(compiledPolicy) {
    const version = `${Date.now()}-${this.policies.length + 1}`;
    const record = {
      version,
      compiledPolicy,
      createdAt: new Date()
    };
    this.policies.push(record);
    return record;
  }

  async getActivePolicy() {
    if (this.policies.length === 0) {
      return null;
    }
    return this.policies[this.policies.length - 1] ?? null;
  }

  async getPolicyByVersion(version) {
    return this.policies.find((p) => p.version === version) ?? null;
  }

  async listPolicies() {
    return [...this.policies];
  }
}

