import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { MCP_DIR } from '../utils/FileSystem.js';

export function listMCP() {
    console.log(chalk.cyan('OpenShell MCP Manager'));
    if (!fs.existsSync(MCP_DIR)) {
        console.log(chalk.yellow('MCP directory not found.'));
        return;
    }

    const files = fs.readdirSync(MCP_DIR);
    if (files.length === 0) {
        console.log(chalk.yellow('No MCP files found in ' + MCP_DIR));
    } else {
        console.log(chalk.green('Current MCP Files:'));
        files.forEach(f => console.log(`- ${f}`));
    }
}

export const mcpCommand = new Command('mcp')
    .description('Manage Model Context Protocol (MCP) files')
    .action(listMCP);
