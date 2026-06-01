import Anthropic from '@anthropic-ai/sdk';
import { LLMBackend } from './LLMBackend.js';

// Strategy: calls the Claude API via Anthropic SDK
export class ClaudeApiAdapter extends LLMBackend {
  constructor() {
    super();
    this.client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    this.model = 'claude-sonnet-4-6';
  }

  async generate(prompt) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0]?.text ?? '';
  }
}
