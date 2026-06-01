// Strategy interface — all concrete adapters must implement generate(prompt)
export class LLMBackend {
  async generate(prompt) {
    throw new Error('generate(prompt) must be implemented by concrete adapter');
  }
}
