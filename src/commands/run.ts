import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { SKILLS_DIR } from '../utils/FileSystem.js';
import { Agent } from '../core/Agent.js';
import inquirer from 'inquirer';
import { marked } from 'marked';

export const runCommand = new Command('run')
    .description('Execute a specific resource');

runCommand.command('skill <name>')
    .description('Run a specific skill')
    .action(async (name) => {
        let skillFile = name;
        if (!skillFile.endsWith('.md')) skillFile += '.md';
        
        const skillPath = path.join(SKILLS_DIR, skillFile);
        
        if (!fs.existsSync(skillPath)) {
            console.log(chalk.red(`\n  ❌ Skill not found: ${name}`));
            console.log(chalk.grey(`  Path: ${skillPath}\n`));
            return;
        }

        console.log(chalk.cyan.bold(`\n  🚀 Running Skill: ${name}\n`));
        
        const content = fs.readFileSync(skillPath, 'utf-8');
        
        // Extraer prompts requeridos si los hay
        const inputMatch = content.match(/### Entrada\n([\s\S]*?)\n###/);
        let userPrompt = '';
        
        if (inputMatch?.[1]) {
            const lines = inputMatch[1].trim().split('\n');
            const { promptValue } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'promptValue',
                    message: chalk.blue(`❯ Enter ${lines[0]?.replace(/^- `|`: .*/g, '') || 'input'}:`),
                    validate: (input: string) => input.trim() !== '' || 'Input is required'
                }
            ]);
            userPrompt = promptValue;
        } else {
            const { promptValue } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'promptValue',
                    message: chalk.blue('❯ prompt:'),
                }
            ]);
            userPrompt = promptValue;
        }

        const agent = new Agent();
        const fullPrompt = `Using the following skill definition:\n\n${content}\n\nUser Input: ${userPrompt}`;
        
        process.stdout.write(chalk.magenta('\n  OpenShell: '));
        const response = await agent.ask(fullPrompt, (token) => {
            process.stdout.write(token);
        });
        
        console.log('\n');
    });
