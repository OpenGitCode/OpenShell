#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { ensureDirectories } from './utils/FileSystem.js';
import { configCommand, runConfig } from './commands/config.js';
import { chatCommand, startChat } from './commands/chat.js';
import { listCommand } from './commands/list.js';
import { runCommand } from './commands/run.js';
import { doctorCommand } from './commands/doctor.js';
import { mcpCommand } from './commands/mcp.js';
import { displayBanner, displayWelcome } from './utils/UI.js';
import config from './core/Config.js';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { AUTO_DIR } from './utils/FileSystem.js';
import figlet from 'figlet';
import gradient from 'gradient-string';

const program = new Command();

// Asegurar directorios
ensureDirectories();

program
    .name('openshell')
    .description('Supercharged AI CLI for your terminal')
    .version('2.0.0')
    .action(async () => {
        if (process.argv.length <= 2) {
            const provider = config.get('provider');
            const apiKey = config.get('apiKey');
            const ollamaUrl = config.get('ollamaUrl');

            if (!apiKey && (provider === 'openai' || provider === 'anthropic')) {
                displayWelcome();
                await runConfig();
                startChat();
            } else {
                startChat();
            }
        }
    });

program.addCommand(configCommand);
program.addCommand(chatCommand);
program.addCommand(listCommand);
program.addCommand(runCommand);
program.addCommand(doctorCommand);
program.addCommand(mcpCommand);

program.command('add <type>')
    .description('Add a new resource (skill or automation)')
    .action(async (type) => {
        if (type === 'automation') {
            console.log(chalk.cyan('\n  🆕 Creating new automation...'));
            const { name } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Automation name (e.g. backup_daily):',
                    validate: (input) => input.trim() !== '' || 'Name is required'
                }
            ]);

            const template = `name: ${name}
trigger: cron("0 2 * * *")
action:
  type: script
  path: scripts/${name}.sh`;

            const filePath = path.join(AUTO_DIR, `${name}.yaml`);
            fs.writeFileSync(filePath, template);
            console.log(chalk.green(`\n  ✅ Automation created at: ${filePath}`));
            console.log(chalk.grey('  You can now edit this file to customize the behavior.\n'));
        } else {
            console.log(chalk.yellow(`\n  ⚠️  Adding ${type} is not yet implemented via CLI. Please create a .md file in the SKILLS directory.\n`));
        }
    });

program.command('origin', { hidden: true })
    .description('The source of all things')
    .action(() => {
        console.clear();
        const banner = figlet.textSync('OpenGit', { font: 'Standard' });
        console.log(gradient.atlas.multiline(banner));
        console.log(chalk.bold.cyan('\n  🛡️  INTEGRITY VERIFIED: Original Source Code by OpenGit'));
        console.log(chalk.white('  This project is part of the OpenGit ecosystem. All rights reserved.\n'));
        console.log(chalk.grey('  "Innovation is the movement from the old to the new, but the soul remains."\n'));
    });

program.parse(process.argv);
