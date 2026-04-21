import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { SKILLS_DIR, AUTO_DIR } from '../utils/FileSystem.js';

function createTable(headers: string[], rows: string[][]) {
    const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => r[i]?.length || 0)) + 2);
    
    const hr = '├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤';
    const top = '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐';
    const bottom = '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';

    const formatRow = (row: string[]) => '│' + row.map((c, i) => ` ${c.padEnd((colWidths[i] || 0) - 1)}`).join('│') + '│';

    let table = top + '\n';
    table += formatRow(headers) + '\n';
    table += hr + '\n';
    rows.forEach((row, i) => {
        table += formatRow(row) + '\n';
        if (i < rows.length - 1) table += hr + '\n';
    });
    table += bottom;
    return table;
}

export const listCommand = new Command('list')
    .description('List available resources');

listCommand.command('skills')
    .description('List all available skills')
    .action(() => {
        console.log(chalk.cyan.bold('\n  📦 OpenShell Skills\n'));
        if (!fs.existsSync(SKILLS_DIR)) {
            console.log(chalk.yellow('  Skills directory not found.'));
            return;
        }

        const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'));
        if (files.length === 0) {
            console.log(chalk.yellow('  No skills found.'));
        } else {
            const rows: string[][] = files.map(f => {
                const content = fs.readFileSync(path.join(SKILLS_DIR, f), 'utf-8');
                const title = content.split('\n')[0]?.replace('#', '').trim() || f;
                const descMatch = content.match(/### Descripción\n([\s\S]*?)\n###/);
                const description = (descMatch?.[1] ?? 'No description').trim().split('\n')[0] ?? 'No description';
                return [title, description, f];
            });
            console.log(createTable(['Skill', 'Description', 'File'], rows));
        }
        console.log();
    });

listCommand.command('automations')
    .description('List all active automations')
    .action(() => {
        console.log(chalk.magenta.bold('\n  🤖 OpenShell Automations\n'));
        if (!fs.existsSync(AUTO_DIR)) {
            console.log(chalk.yellow('  Automations directory not found.'));
            return;
        }

        const files = fs.readdirSync(AUTO_DIR);
        if (files.length === 0) {
            console.log(chalk.yellow('  No automations found.'));
        } else {
            const rows = files.map(f => [f, 'Active', `openshell log ${f}`]);
            console.log(createTable(['Automation', 'Status', 'Log Command'], rows));
        }
        console.log();
    });
