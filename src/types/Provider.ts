export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface Provider {
    chat(messages: Message[], onToken?: (token: string) => void): Promise<string>;
}
