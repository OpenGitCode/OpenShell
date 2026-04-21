import fetch from 'node-fetch';
import type { Provider, Message } from '../../types/Provider.js';
import config from '../Config.js';

export class GeminiProvider implements Provider {
    async chat(messages: Message[], onToken?: (token: string) => void): Promise<string> {
        const apiKey = config.get('apiKey');
        const model = config.get('model') || 'gemini-1.5-flash';

        if (!apiKey) {
            throw new Error('Gemini API Key not configured. Use "openshell config" to set it.');
        }

        // Convertir mensajes al formato de Gemini
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json() as any;
                throw new Error(`Gemini API Error: ${error[0]?.error?.message || response.statusText}`);
            }

            let fullText = '';
            const body = response.body as any;

            return new Promise((resolve, reject) => {
                let buffer = '';
                body.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    
                    // Gemini envía objetos JSON en un array, pero vía streaming envía fragmentos
                    // El formato de stream de Gemini es un poco diferente (JSON array)
                    // Intentamos parsear cada objeto JSON completo que llegue
                    try {
                        // El stream de Gemini es un array de objetos: [ {...}, {...} ]
                        // Limpiamos los caracteres de inicio/fin de array si es necesario
                        let cleanBuffer = buffer.trim();
                        if (cleanBuffer.startsWith('[')) cleanBuffer = cleanBuffer.slice(1);
                        if (cleanBuffer.endsWith(']')) cleanBuffer = cleanBuffer.slice(0, -1);
                        if (cleanBuffer.startsWith(',')) cleanBuffer = cleanBuffer.slice(1);

                        // Dividir por objetos JSON (asumiendo que vienen bien formados)
                        // Esto es simplificado, en un entorno real usaríamos un parser de stream JSON
                        const parts = cleanBuffer.split('}\r\n, {').map((p, i, a) => {
                            if (a.length === 1) return p;
                            if (i === 0) return p + '}';
                            if (i === a.length - 1) return '{' + p;
                            return '{' + p + '}';
                        });

                        for (const part of parts) {
                            try {
                                const json = JSON.parse(part);
                                const token = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                                if (token) {
                                    fullText += token;
                                    if (onToken) onToken(token);
                                    // Limpiar buffer de lo que ya procesamos satisfactoriamente
                                    buffer = ''; 
                                }
                            } catch (e) {
                                // Objeto incompleto, esperar a más data
                            }
                        }
                    } catch (e) {
                        // Error general, esperar a más data
                    }
                });
                body.on('error', reject);
                body.on('end', () => resolve(fullText));
            });
        } catch (error: any) {
            throw new Error(`Failed to connect to Gemini: ${error.message}`);
        }
    }
}
