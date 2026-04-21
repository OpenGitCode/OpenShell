import fs from 'fs';
import path from 'path';
import { getModelContextDir } from '../utils/FileSystem.js';
import config from './Config.js';

interface Learning {
    key: string;
    value: any;
    confidence: number;
    lastUpdated: string;
}

export class Memory {
    private memoryFile: string;
    private learnings: Record<string, Learning> = {};

    constructor() {
        const modelName = config.get('model') || 'default';
        const contextDir = getModelContextDir(modelName);
        this.memoryFile = path.join(contextDir, 'memory.json');
        this.load();
    }

    private load() {
        if (fs.existsSync(this.memoryFile)) {
            try {
                this.learnings = JSON.parse(fs.readFileSync(this.memoryFile, 'utf-8'));
            } catch (e) {
                this.learnings = {};
            }
        }
    }

    private save() {
        const dir = path.dirname(this.memoryFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.memoryFile, JSON.stringify(this.learnings, null, 2));
    }

    public learn(key: string, value: any, confidence: number = 0.5) {
        this.learnings[key] = {
            key,
            value,
            confidence,
            lastUpdated: new Date().toISOString()
        };
        this.save();
    }

    public getRecall(): string {
        const keys = Object.keys(this.learnings);
        if (keys.length === 0) return "No hay preferencias aprendidas aún.";
        
        return keys.map(k => {
            const l = this.learnings[k];
            return `- Preferencia aprendida [${k}]: ${JSON.stringify(l.value)} (Confianza: ${l.confidence})`;
        }).join('\n');
    }

    public getLearning(key: string): any {
        return this.learnings[key]?.value;
    }
}
