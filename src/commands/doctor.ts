import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { OPEN_SHELL_DIR, SKILLS_DIR, CONTEXT_DIR, AUTO_DIR } from '../utils/FileSystem.js';
import config from '../core/Config.js';
import nodeFetch from 'node-fetch';

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

export const doctorCommand = new Command('doctor')
    .description('Diagnose OpenShell configuration and connectivity')
    .action(async () => {
        console.log(chalk.cyan.bold('\n  🩺 OpenShell Doctor - System Diagnosis\n'));

        const results: string[][] = [];

        // 1. Verificar Directorios
        const checkDir = (name: string, path: string) => {
            const exists = fs.existsSync(path);
            results.push([name, exists ? chalk.green('OK') : chalk.red('Missing'), path]);
        };

        checkDir('Main Directory', OPEN_SHELL_DIR);
        checkDir('Skills Directory', SKILLS_DIR);
        checkDir('Context Directory', CONTEXT_DIR);
        checkDir('Automations Directory', AUTO_DIR);

        console.log(chalk.white.bold('  1. Directory Structure:'));
        console.log(createTable(['Component', 'Status', 'Path'], results));
        console.log();

        // 2. Verificar Configuración y Conectividad
        const provider = config.get('provider');
        const apiKey = config.get('apiKey');
        const model = config.get('model');

        console.log(chalk.white.bold('  2. Provider Connectivity:'));
        const connResults: string[][] = [];
        connResults.push(['Provider', provider, chalk.green('Configured')]);
        connResults.push(['Model', model || 'default', model ? chalk.green('OK') : chalk.yellow('Default')]);

        let connectivityStatus = chalk.grey('Not Tested');

        if (provider === 'ollama') {
            const url = config.get('ollamaUrl') || 'http://localhost:11434';
            try {
                const res = await nodeFetch(`${url}/api/tags`);
                connectivityStatus = res.ok ? chalk.green('Connected') : chalk.red('Failed');
            } catch (e) {
                connectivityStatus = chalk.red('Offline (Check Ollama)');
            }
        } else if (apiKey) {
            connectivityStatus = chalk.green('API Key Present');
            // Aquí se podría hacer un ping real a la API en el futuro
        } else {
            connectivityStatus = chalk.red('Missing API Key');
        }

        connResults.push(['Connectivity', provider, connectivityStatus]);
        console.log(createTable(['Check', 'Value', 'Status'], connResults));

        console.log(chalk.cyan.bold('\n  Diagnosis Complete!\n'));
    });
