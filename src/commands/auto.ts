import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { AUTO_DIR } from '../utils/FileSystem.js';

export const autoCommand = new Command('auto')
    .description('Manage and run automations')
    .action(() => {
        console.log(chalk.cyan('Openshell Automations Manager'));
        const files = fs.readdirSync(AUTO_DIR);
        if (files.length === 0) {
            console.log(chalk.yellow('No automations found. Create one in ' + AUTO_DIR));
        } else {
            console.log(chalk.green('Available Automations:'));
            files.forEach(f => console.log(`- ${f}`));
        }
    });
