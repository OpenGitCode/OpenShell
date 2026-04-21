import type { Message, Provider } from '../types/Provider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { OllamaProvider } from './providers/OllamaProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { OpenRouterProvider } from './providers/OpenRouterProvider.js';
import config from './Config.js';
import { readSkills, getModelContextDir } from '../utils/FileSystem.js';
import fs from 'fs';
import path from 'path';

export class Agent {
    private provider: Provider;
    private history: Message[] = [];
    private contextFile: string;

    constructor() {
        const providerType = config.get('provider');
        if (providerType === 'openai') {
            this.provider = new OpenAIProvider();
        } else if (providerType === 'ollama') {
            this.provider = new OllamaProvider();
        } else if (providerType === 'anthropic') {
            this.provider = new AnthropicProvider();
        } else if (providerType === 'openrouter') {
            this.provider = new OpenRouterProvider();
        } else {
            throw new Error(`Provider ${providerType} not implemented yet.`);
        }

        const modelName = config.get('model');
        const contextDir = getModelContextDir(modelName);
        this.contextFile = path.join(contextDir, 'history.json');
        this.loadHistory();
    }

    private loadHistory() {
        if (fs.existsSync(this.contextFile)) {
            try {
                this.history = JSON.parse(fs.readFileSync(this.contextFile, 'utf-8'));
            } catch (e) {
                this.history = [];
            }
        }
    }

    private saveHistory() {
        fs.writeFileSync(this.contextFile, JSON.stringify(this.history, null, 2));
    }

    async ask(userInput: string, onToken?: (token: string) => void): Promise<string> {
        const skills = readSkills();
        const autonomousMode = config.get('autonomousMode');
        
        // Procesar menciones de archivos @[archivo.ext]
        const fileRegex = /@\[(.*?)\]/g;
        let fileContext = '';
        let match;
        while ((match = fileRegex.exec(userInput)) !== null) {
            const fileName = match[1];
            if (fileName && fs.existsSync(fileName)) {
                try {
                    const content = fs.readFileSync(fileName, 'utf-8');
                    fileContext += `\nContent of file "${fileName}":\n\`\`\`\n${content}\n\`\`\`\n`;
                } catch (e) {
                    fileContext += `\n(Could not read file "${fileName}")\n`;
                }
            }
        }

        const systemPrompt = `You are OpenShell, a terminal AI. 
User: ${process.env.USER || 'User'} (Corona)
Context: ${process.cwd()} (${process.platform})
Skills: ${skills.join(', ')}
${fileContext ? 'Files: ' + fileContext : ''}
Capabilities: search_web, read_file, write_file, execute_command.
Rules: 
- Use TOOL_CALL: {"tool": "...", ...} for tools.
- If using \`\`\`bash blocks, ONLY put the raw command inside. No labels or prefixes.
- Be concise.`;

        const messages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...this.history,
            { role: 'user', content: userInput }
        ];

        const response = await this.provider.chat(messages, onToken);
        
        this.history.push({ role: 'user', content: userInput });
        this.history.push({ role: 'assistant', content: response });
        this.saveHistory();

        return response;
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
    }
}
