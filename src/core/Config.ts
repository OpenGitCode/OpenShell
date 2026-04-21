import Conf from 'conf';
import 'dotenv/config';

interface ConfigSchema {
    provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter';
    model: string;
    apiKey?: string;
    ollamaUrl?: string;
    autonomousMode: boolean;
}

const conf = new Conf<ConfigSchema>({
    projectName: 'openshell',
    defaults: {
        provider: (process.env.DEFAULT_PROVIDER as any) || 'openai',
        model: process.env.DEFAULT_MODEL || 'gpt-4o',
        autonomousMode: false
    }
});

// Wrapper para priorizar variables de entorno
const config = {
    get: (key: keyof ConfigSchema): any => {
        if (key === 'apiKey' && process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
        if (key === 'model' && process.env.DEFAULT_MODEL) return process.env.DEFAULT_MODEL;
        if (key === 'provider' && process.env.DEFAULT_PROVIDER) return process.env.DEFAULT_PROVIDER;
        return conf.get(key);
    },
    set: (key: keyof ConfigSchema, value: any) => {
        conf.set(key, value);
    }
};

export default config;
