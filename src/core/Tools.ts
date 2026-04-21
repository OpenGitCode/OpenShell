import { search } from 'duck-duck-scrape';
import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';

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
    if (!fs.existsSync(path)) return `Error: File ${path} does not exist.`;
    try {
        return fs.readFileSync(path, 'utf-8');
    } catch (error: any) {
        return `Error reading file: ${error.message}`;
    }
}

export function writeFile(path: string, content: string) {
    try {
        fs.writeFileSync(path, content);
        return `Successfully wrote to ${path}`;
    } catch (error: any) {
        return `Error writing file: ${error.message}`;
    }
}

export function executeCommand(command: string) {
    try {
        const output = execSync(command, { encoding: 'utf-8' });
        return output || 'Command executed successfully (no output).';
    } catch (error: any) {
        return `Error executing command: ${error.message}`;
    }
}
