import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import config from '../core/Config.js';

function createTable(headers: string[], rows: string[][]) {
    const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => r[i]?.length || 0)) + 2);
    const hr = '├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤';
    const top = '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐';
    const bottom = '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';
    const formatRow = (row: string[]) => '│' + row.map((c, i) => ` ${c.padEnd((colWidths[i] || 0) - 1)}`).join('│') + '│';

    let table = top + '\n' + formatRow(headers) + '\n' + hr + '\n';
    rows.forEach((row, i) => {
        table += formatRow(row) + '\n';
        if (i < rows.length - 1) table += hr + '\n';
    });
    table += bottom;
    return table;
}

export async function runConfig() {
    console.log(chalk.cyan.bold('\n  ⚙️  OpenShell Configuration Wizard\n'));
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'provider',
            message: 'Select LLM Provider:',
            choices: ['openai', 'anthropic', 'openrouter', 'ollama', 'gemini'],
            default: config.get('provider')
        },
        {
            type: 'input',
            name: 'model',
            message: 'Enter Model Name:',
            default: (ans: any) => {
                if (ans.provider === 'openai') return 'gpt-4o';
                if (ans.provider === 'gemini') return 'gemini-1.5-flash';
                return 'llama3';
            },
            when: (ans: any) => ans.provider !== 'openai' || !config.get('model')
        },
        {
            type: 'password',
            name: 'apiKey',
            message: 'Enter API Key:',
            when: (ans: any) => ans.provider !== 'ollama'
        },
        {
            type: 'input',
            name: 'ollamaUrl',
            message: 'Enter Ollama URL:',
            default: 'http://localhost:11434',
            when: (ans: any) => ans.provider === 'ollama'
        },
        {
            type: 'confirm',
            name: 'autonomousMode',
            message: 'Enable Autonomous Mode? (IA can run commands without asking)',
            default: config.get('autonomousMode')
        }
    ]);

    config.set('provider', answers.provider);
    if (answers.model) config.set('model', answers.model);
    if (answers.apiKey) config.set('apiKey', answers.apiKey);
    if (answers.ollamaUrl) config.set('ollamaUrl', answers.ollamaUrl);
    config.set('autonomousMode', answers.autonomousMode);

    console.log(chalk.green('\n  ✅ Configuration saved successfully!\n'));
}

export const configCommand = new Command('config')
    .description('Configure Openshell settings')
    .action(async () => {
        await runConfig();
    });

configCommand.command('show')
    .description('Show current configuration')
    .action(() => {
        console.log(chalk.cyan.bold('\n  📋 Current Configuration\n'));
        const mask = (key: string) => key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : chalk.grey('None');
        
        const rows = [
            ['Provider', config.get('provider') || 'Not set'],
            ['Model', config.get('model') || 'Default'],
            ['API Key', mask(config.get('apiKey') as string)],
            ['Ollama URL', config.get('ollamaUrl') || 'http://localhost:11434'],
            ['Autonomous', config.get('autonomousMode') ? chalk.green('Enabled') : chalk.yellow('Disabled')]
        ];

        console.log(createTable(['Option', 'Value'], rows));
        console.log();
    });
