import fetch from 'node-fetch';
import type { Provider, Message } from '../../types/Provider.js';
import config from '../Config.js';

export class AnthropicProvider implements Provider {
    async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
        const apiKey = config.get('apiKey');
        const model = config.get('model') || 'claude-3-sonnet-20240229';

        if (!apiKey) {
            throw new Error('Anthropic API Key not configured. Use "/config" to set it.');
        }

        // Anthropic requiere un formato ligeramente diferente
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const userMessages = messages.filter(m => m.role !== 'system');

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    system: systemMessage,
                    messages: userMessages,
                    stream: true,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                const error = await response.json() as any;
                throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
            }

            let fullText = '';
            const body = response.body as any;

            return new Promise((resolve, reject) => {
                body.on('data', (chunk: Buffer) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            try {
                                const json = JSON.parse(data);
                                if (json.type === 'content_block_delta' && json.delta?.text) {
                                    const token = json.delta.text;
                                    fullText += token;
                                    if (onToken) onToken(token);
                                }
                                if (json.type === 'message_stop') {
                                    resolve(fullText);
                                }
                            } catch (e) {
                                // Fragmento incompleto
                            }
                        }
                    }
                });
                body.on('error', reject);
                body.on('end', () => resolve(fullText));
            });
        } catch (error: any) {
            throw new Error(`Failed to connect to Anthropic: ${error.message}`);
        }
    }
}
