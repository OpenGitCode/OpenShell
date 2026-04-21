import fetch from 'node-fetch';
import type { Provider, Message } from '../../types/Provider.js';
import config from '../Config.js';

export class OpenAIProvider implements Provider {
    async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
        const apiKey = config.get('apiKey');
        const model = config.get('model') || 'gpt-4o';

        if (!apiKey) {
            throw new Error('OpenAI API Key not configured. Use "openshell config" to set it.');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                const error = await response.json() as any;
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }

            let fullText = '';
            const body = response.body as any;

            return new Promise((resolve, reject) => {
                body.on('data', (chunk: Buffer) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            try {
                                const json = JSON.parse(data);
                                const token = json.choices[0]?.delta?.content || '';
                                if (token) {
                                    fullText += token;
                                    if (onToken) onToken(token);
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
            throw new Error(`Failed to connect to OpenAI: ${error.message}`);
        }
    }
}
