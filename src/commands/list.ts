import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { SKILLS_DIR, LOCAL_SKILLS_DIR, AUTO_DIR } from '../utils/FileSystem.js';

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
        const rows: string[][] = [];

        const findSkills = (dir: string) => {
            if (!fs.existsSync(dir)) return;
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    const skillFile = path.join(fullPath, 'SKILL.md');
                    if (fs.existsSync(skillFile)) {
                        const content = fs.readFileSync(skillFile, 'utf-8');
                        const nameMatch = content.match(/name:\s*(.*)/);
                        const descMatch = content.match(/description:\s*(.*)/);
                        const name = nameMatch?.[1] || item;
                        const desc = descMatch?.[1] || 'No description';
                        rows.push([name, desc, path.relative(process.cwd(), fullPath)]);
                    } else {
                        findSkills(fullPath);
                    }
                } else if (item.endsWith('.md')) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const title = content.split('\n')[0]?.replace('#', '').trim() || item;
                    rows.push([title, 'Standard Skill', path.relative(process.cwd(), fullPath)]);
                }
            }
        };

        findSkills(SKILLS_DIR);
        findSkills(LOCAL_SKILLS_DIR);

        if (rows.length === 0) {
            console.log(chalk.yellow('  No skills found.'));
        } else {
            console.log(createTable(['Skill', 'Description', 'Path'], rows));
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
