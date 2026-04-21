import fetch from 'node-fetch';
import type { Provider, Message } from '../../types/Provider.js';
import config from '../Config.js';

export class OllamaProvider implements Provider {
    async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
        const model = config.get('model');
        const ollamaUrl = config.get('ollamaUrl') || 'http://localhost:11434';

        try {
            const response = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API Error: ${response.statusText} - ${errorText}`);
            }

            let fullText = '';
            const body = response.body as any;

            return new Promise((resolve, reject) => {
                let buffer = '';
                body.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    let boundary = buffer.indexOf('\n');
                    
                    while (boundary !== -1) {
                        const line = buffer.slice(0, boundary).trim();
                        buffer = buffer.slice(boundary + 1);
                        
                        if (line) {
                            try {
                                const json = JSON.parse(line);
                                if (json.message?.content) {
                                    const token = json.message.content;
                                    fullText += token;
                                    if (onToken) onToken(token);
                                }
                                if (json.done) {
                                    resolve(fullText);
                                    return;
                                }
                            } catch (e) {
                                // Error de parseo, esperar a más datos
                            }
                        }
                        boundary = buffer.indexOf('\n');
                    }
                });
                body.on('error', reject);
                body.on('end', () => resolve(fullText));
            });
        } catch (error: any) {
            throw new Error(`Failed to connect to Ollama at ${ollamaUrl}. Make sure Ollama is running.\nDetail: ${error.message}`);
        }
    }

    async getModels(): Promise<string[]> {
        const ollamaUrl = config.get('ollamaUrl') || 'http://localhost:11434';
        try {
            const response = await fetch(`${ollamaUrl}/api/tags`);
            if (!response.ok) return [];
            const data = await response.json() as any;
            return data.models?.map((m: any) => m.name) || [];
        } catch (e) {
            return [];
        }
    }
}
