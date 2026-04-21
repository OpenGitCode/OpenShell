import fetch from 'node-fetch';
import type { Provider, Message } from '../../types/Provider.js';
import config from '../Config.js';

export class OpenRouterProvider implements Provider {
    async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
        const apiKey = config.get('apiKey');
        const model = config.get('model') || 'openrouter/free'; // Router de modelos gratuitos

        if (!apiKey) {
            throw new Error('OpenRouter API Key not configured. Use "/config" to set it.');
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://github.com/OpenGit/OpenShell',
                    'X-Title': 'OpenShell CLI',
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
                throw new Error(`OpenRouter API Error: ${error.error?.message || response.statusText}`);
            }

            let fullText = '';
            const body = response.body as any;

            return new Promise((resolve, reject) => {
                body.on('data', (chunk: Buffer) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data.trim() === '[DONE]') continue;
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
            throw new Error(`Failed to connect to OpenRouter: ${error.message}`);
        }
    }
}
