import { Command } from 'commander';
import inquirer from 'inquirer';
// @ts-ignore
import autocomplete from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { Agent } from '../core/Agent.js';
import { listSkills } from './skills.js';
import { listMCP } from './mcp.js';
import { displayBanner, rainbowText } from '../utils/UI.js';
import { execSync } from 'child_process';
import config from '../core/Config.js';
import readline from 'readline';
import os from 'os';
import path from 'path';
import fs from 'fs';

// Registrar el plugin de autocompletado
inquirer.registerPrompt('autocomplete', autocomplete);

import { runConfig } from './config.js';
import { OllamaProvider } from '../core/providers/OllamaProvider.js';
import { marked } from 'marked';
// @ts-ignore
import TerminalRenderer from 'marked-terminal';

// Configurar el renderizado de Markdown para terminal
marked.setOptions({
    // @ts-ignore
    renderer: new TerminalRenderer({
        codespan: chalk.yellow,
        blockquote: chalk.gray.italic,
        firstHeading: chalk.magenta.bold,
        heading: chalk.cyan.bold,
        strong: chalk.bold.white,
        em: chalk.italic,
        href: chalk.blue.underline,
        unescape: true
    })
});

import { searchWeb, readFile, writeFile, executeCommand } from '../core/Tools.js';

export async function startChat() {
    let agent = new Agent();
    let loadingInterval: any = null;
    
    const handleToolCall = async (response: string): Promise<string | null> => {
        const match = response.match(/TOOL_CALL: (\{.*\})/);
        if (!match || !match[1]) return null;

        try {
            const call = JSON.parse(match[1]);
            let result = '';
            
            // Crear un log temporal para esta acción
            const logId = Math.random().toString(36).substring(7);
            const logPath = path.join(os.tmpdir(), `openshell_tool_${logId}.log`);
            
            process.stdout.write(`\r${chalk.yellow('🛠️  Agent: ')}${chalk.bold(call.tool)}... `);

            switch (call.tool) {
                case 'search_web':
                    const searchResults = await searchWeb(call.query);
                    result = JSON.stringify(searchResults, null, 2);
                    break;
                case 'read_file':
                    result = readFile(call.path);
                    break;
                case 'write_file':
                    result = writeFile(call.path, call.content);
                    break;
                case 'execute_command':
                    result = executeCommand(call.command);
                    break;
                default:
                    result = `Unknown tool: ${call.tool}`;
            }

            // Guardar el detalle completo en el log
            const logContent = `TOOL: ${call.tool}\nINPUT: ${JSON.stringify(call, null, 2)}\n\nOUTPUT:\n${result}`;
            fs.writeFileSync(logPath, logContent);

            // Generar un hipervínculo de terminal (OSC 8) si es posible
            // Sintaxis: \x1b]8;;url\x1b\text\x1b]8;;\x1b\
            const link = `\x1b]8;;file://${logPath}\x1b\\[Ver Detalles]\x1b]8;;\x1b\\`;
            
            process.stdout.write(`${chalk.green('Done!')} ${chalk.cyan(link)}\n`);

            return `TOOL_RESULT: ${result}`;
        } catch (e) {
            return `TOOL_ERROR: Invalid JSON format for tool call.`;
        }
    };
    const handleCommand = async (cmd: string): Promise<boolean> => {
        const command = cmd.toLowerCase().trim();
        switch (command) {
            case '/exit':
                return true;
            case '/clear':
                agent.clearHistory();
                displayBanner();
                console.log(chalk.yellow('History cleared.\n'));
                return false;
            case '/config':
                await runConfig();
                agent = new Agent();
                displayBanner();
                console.log(chalk.green('Configuration updated and agent restarted.\n'));
                return false;
            case (cmd.startsWith('/model ') ? cmd : ''):
                const newModel = cmd.split(' ')[1];
                if (newModel) {
                    config.set('model', newModel);
                    agent = new Agent();
                    console.log(chalk.green(`Model switched to: ${chalk.bold(newModel)}\n`));
                } else {
                    console.log(chalk.yellow('Usage: /model <model_name>'));
                }
                return false;
            case '/skills':
                listSkills();
                return false;
            case '/mcp':
                listMCP();
                return false;
            case '/models':
                if (config.get('provider') === 'ollama') {
                    const ollama = new OllamaProvider();
                    const models = await ollama.getModels();
                    console.log(chalk.cyan('\nAvailable Local Models (Ollama):'));
                    models.forEach((m: string) => console.log(`  - ${m}`));
                    console.log();
                } else {
                    console.log(chalk.yellow('\nListing models is currently only supported for Ollama provider.\n'));
                }
                return false;
            case '/genesis':
                console.log(chalk.magenta('\n  🌀 The ancient records mention a source called "origin".'));
                console.log(chalk.grey('  Perhaps the shell remembers its true creators... Try searching outside the chat.\n'));
                return false;
            case '/help':
                console.log(chalk.cyan('\nAvailable Commands:'));
                console.log(`  ${rainbowText('/clear')}          - Clear conversation history`);
                console.log(`  ${rainbowText('/config')}         - Open configuration wizard`);
                console.log(`  ${rainbowText('/model <name>')}   - Switch LLM model instantly`);
                console.log(`  ${rainbowText('/models')}         - List available local models`);
                console.log(`  ${rainbowText('/help')}           - Show this help message`);
                console.log(`  ${rainbowText('/exit')}           - Quit OpenShell\n`);
                return false;
            default:
                console.log(chalk.red(`Unknown command: ${cmd}. Type /help for assistance.`));
                return false;
        }
    };

    const commands = ['/help', '/clear', '/config', '/model', '/models', '/skills', '/mcp', '/exit'];

    displayBanner();
    console.log(chalk.cyan('Welcome to OpenShell Chat! Type /help for commands, /exit to quit.\n'));

    while (true) {
        const { input } = await inquirer.prompt([
            {
                type: 'autocomplete',
                name: 'input',
                message: chalk.blue('❯'),
                emptyText: 'No commands found',
                searchText: 'Searching...',
                source: (answers: any, input: string) => {
                    const currentInput = input || '';
                    if (currentInput.startsWith('/')) {
                        return Promise.resolve(commands.filter(c => c.startsWith(currentInput)));
                    }
                    // Si no empieza con /, devolvemos el input actual como única opción
                    // para evitar que el motor de búsqueda intente "completar" texto normal
                    return Promise.resolve([currentInput]);
                },
                suggestOnly: true
            }
        ]);

        if (!input || !input.trim()) continue;

        if (input.startsWith('/')) {
            const shouldExit = await handleCommand(input);
            if (shouldExit) break;
            continue;
        }

        try {
            // Animación de pensamiento
            const loader = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
            let i = 0;
            loadingInterval = setInterval(() => {
                process.stdout.write(`\r${chalk.yellow(loader[i++ % loader.length])} Thinking...`);
            }, 100);

            // GUARDAR POSICIÓN: Antes de imprimir tokens
            process.stdout.write('\x1b[s'); 

            let response = await agent.ask(input, (token) => {
                if (i !== -1) {
                    clearInterval(loadingInterval);
                    process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
                    process.stdout.write(chalk.magenta('OpenShell: '));
                    i = -1;
                    // Re-guardar después del prefijo
                    process.stdout.write('\x1b[s'); 
                }
                process.stdout.write(token);
            });
            
            // Ciclo de herramientas
            let toolResult = await handleToolCall(response);
            while (toolResult) {
                response = await agent.ask(toolResult);
                toolResult = await handleToolCall(response);
            }

            if (i !== -1 && loadingInterval) {
                clearInterval(loadingInterval);
            }

            // RESTAURAR Y LIMPIAR: Volver al inicio y borrar todo el streaming
            process.stdout.write('\x1b[u'); // Volver a la posición guardada
            process.stdout.write('\x1b[J'); // Borrar todo desde el cursor hasta el final
            
            process.stdout.write(marked.parse(response) + '\n');
            
            // ... (resto del código de detección de comandos bash se mantiene igual)

            // Detectar comandos bash
            const bashMatch = response.match(/```bash\n([\s\S]*?)```/);
            if (bashMatch && bashMatch[1]) {
                let commandToRun = bashMatch[1].trim();
                
                // Limpiar prefijos que la IA a veces añade por error
                commandToRun = commandToRun.replace(/^(\$|command|bash|cmd|sh):\s*/i, '').trim();
                commandToRun = commandToRun.replace(/^\$\s*/, '').trim(); // Asegurar eliminación de $
                
                const autonomousMode = config.get('autonomousMode');

                if (autonomousMode) {
                    console.log(chalk.yellow(`Executing suggested command: ${commandToRun}`));
                    try {
                        const output = execSync(commandToRun, { encoding: 'utf-8', stdio: 'inherit' });
                        if (output) console.log(output);
                    } catch (e: any) {
                        console.error(chalk.red(`Command failed: ${e.message}`));
                    }
                } else {
                    const { confirm } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirm',
                            message: chalk.green(`Execute suggested command? (${chalk.bold(commandToRun)})`),
                            default: false
                        }
                    ]);

                    if (confirm) {
                        try {
                            execSync(commandToRun, { encoding: 'utf-8', stdio: 'inherit' });
                        } catch (e: any) {
                            console.error(chalk.red(`Command failed: ${e.message}`));
                        }
                    }
                }
            }
        } catch (error: any) {
            if (loadingInterval) clearInterval(loadingInterval);
            process.stdout.write('\r' + ' '.repeat(20) + '\r');
            console.error(chalk.red(`\nError: ${error.message}\n`));
        }
    }
}

export const chatCommand = new Command('chat')
    .description('Start an interactive chat session with the AI agent')
    .action(startChat);
