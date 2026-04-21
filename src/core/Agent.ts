import type { Message, Provider } from '../types/Provider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { OllamaProvider } from './providers/OllamaProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { OpenRouterProvider } from './providers/OpenRouterProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { Memory } from './Memory.js';
import config from './Config.js';
import { getSkillsSummary, getModelContextDir } from '../utils/FileSystem.js';
import fs from 'fs';
import path from 'path';

export class Agent {
    private provider: Provider;
    private history: Message[] = [];
    private memory: Memory;
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
        } else if (providerType === 'gemini') {
            this.provider = new GeminiProvider();
        } else {
            throw new Error(`Provider ${providerType} not implemented yet.`);
        }

        const modelName = config.get('model');
        const contextDir = getModelContextDir(modelName);
        this.contextFile = path.join(contextDir, 'history.json');
        this.memory = new Memory();
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
        const skillsSummary = getSkillsSummary();
        
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

        const skillsSummary = getSkillsSummary();
        const userLearnings = this.memory.getRecall();

        const systemPrompt = `You are OpenShell, a professional and secure AI assistant by OpenGit.
Operating System: ${process.platform}
Architecture: ${process.arch}
Current User: ${process.env.USER || 'developer'}

Your purpose is to assist the user (Corona, founder of OpenGit) with high-level terminal tasks, automation, and project management.

### Key User Learnings & Preferences:
${userLearnings}

### Available Skills:
${skillsSummary}

Rules:
1. OBEY: Execute commands exactly as asked.
2. IDENTITY: Check your skills to know more about OpenShell/OpenGit.
3. NO INSTALLS: Never use wget, curl, or apt to install.
4. STOP: If a command fails, wait for user instructions.
5. FORMAT: TOOL_CALL: {"tool": "execute_command", "command": "cmd"}`;

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
