import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { SKILLS_DIR } from '../utils/FileSystem.js';

export function listSkills() {
    console.log(chalk.cyan('OpenShell Skills Manager'));
    if (!fs.existsSync(SKILLS_DIR)) {
        console.log(chalk.yellow('Skills directory not found.'));
        return;
    }

    const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
        console.log(chalk.yellow('No skills found. Add .md files to ' + SKILLS_DIR));
    } else {
        console.log(chalk.green('Current Skills:'));
        files.forEach(f => {
            const content = fs.readFileSync(path.join(SKILLS_DIR, f), 'utf-8');
            const title = content.split('\n')[0]?.replace('#', '').trim() || f;
            console.log(`- ${chalk.bold(title)} (${f})`);
        });
    }
}

export const skillsCommand = new Command('skills')
    .description('Manage agent skills')
    .action(listSkills);
