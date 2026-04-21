import { search } from 'duck-duck-scrape';
import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { isSafeCommand, isSensitivePath } from '../utils/Security.js';

export async function searchWeb(query: string) {
    console.log(chalk.yellow(`\n🌐 Searching the web for: "${query}"...`));
    try {
        const results = await search(query);
        return results.results.slice(0, 5).map(r => ({
            title: r.title,
            description: r.description,
            url: r.url
        }));
    } catch (error: any) {
        return `Error searching the web: ${error.message}`;
    }
}

export function readFile(path: string) {
    if (isSensitivePath(path)) {
        return `Error: Access to sensitive path ${path} is blocked for security reasons.`;
    }
    if (!fs.existsSync(path)) return `Error: File ${path} does not exist.`;
    try {
        return fs.readFileSync(path, 'utf-8');
    } catch (error: any) {
        return `Error reading file: ${error.message}`;
    }
}

export function writeFile(path: string, content: string) {
    if (isSensitivePath(path)) {
        return `Error: Writing to sensitive path ${path} is blocked for security reasons.`;
    }
    try {
        fs.writeFileSync(path, content);
        return `Successfully wrote to ${path}`;
    } catch (error: any) {
        return `Error writing file: ${error.message}`;
    }
}

export function executeCommand(command: string) {
    // Note: The caller (chat.ts) should handle user confirmation for unsafe commands.
    // This is a secondary check to prevent catastrophic accidents.
    if (!isSafeCommand(command)) {
        // We still allow it if called through the CLI, but this tool is used by the AI agent.
        // For extra safety, we could block it here if we knew it's an AI call, 
        // but currently chat.ts handles the confirmation.
    }

    try {
        const output = execSync(command, { encoding: 'utf-8' });
        return output || 'Command executed successfully (no output).';
    } catch (error: any) {
        return `Error executing command: ${error.message}`;
    }
}

export function clearTerminal() {
    process.stdout.write('\x1bc');
    return "Terminal cleared.";
}
