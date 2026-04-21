import { Command } from 'commander';
import inquirer from 'inquirer';
// @ts-ignore
import autocomplete from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { Agent } from '../core/Agent.js';
import { listSkills } from './skills.js';
import { listMCP } from './mcp.js';
import { displayBanner, rainbowText, displayResponseHeader, styledCommand } from '../utils/UI.js';
import { execSync } from 'child_process';
import config from '../core/Config.js';
import readline from 'readline';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { isSafeCommand, isSensitivePath } from '../utils/Security.js';

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
        codespan: chalk.hex('#E066FF').bold,
        blockquote: chalk.gray.italic,
        firstHeading: chalk.hex('#8A2BE2').bold.underline,
        heading: chalk.hex('#9370DB').bold,
        strong: chalk.hex('#BA55D3').bold,
        em: chalk.italic.hex('#DA70D6'),
        href: chalk.blue.underline,
        unescape: true,
        listitem: (text: string) => chalk.magenta('  • ') + text + '\n',
        table: (header: string, body: string) => `\n${chalk.magenta(header)}\n${chalk.gray(body)}\n`
    })
});

import { searchWeb, readFile, writeFile, executeCommand, clearTerminal } from '../core/Tools.js';

export async function startChat() {
    let agent = new Agent();
    let loadingInterval: any = null;
    let compactMode = config.get('compactMode') || false;
    
    const handleToolCall = async (response: string): Promise<string | null> => {
        const match = response.match(/\s*TOOL_CALL: (\{.*\})/);
        if (!match || !match[1]) return null;

        try {
            const call = JSON.parse(match[1]);
            let result = '';
            
            const isAutonomous = config.get('autonomousMode');
            let isSafe = false;

            // Determinar si la herramienta es segura
            switch (call.tool) {
                case 'search_web':
                    isSafe = true;
                    break;
                case 'read_file':
                    isSafe = !isSensitivePath(call.path);
                    break;
                case 'write_file':
                    isSafe = !isSensitivePath(call.path);
                    break;
                case 'execute_command':
                    isSafe = isSafeCommand(call.command);
                    break;
                case 'clear_terminal':
                    isSafe = true;
                    break;
                default:
                    isSafe = false;
            }
            
            // SEGURIDAD CRÍTICA: Solo se permite ejecución automática si es SEGURO.
            // Si el comando es sensible, SIEMPRE se pide confirmación, incluso en modo autónomo.
            if (!isSafe) {
                console.log(chalk.yellow(`\n⚠️  Agent wants to use a SENSITIVE tool: ${chalk.bold(call.tool)}`));
                if (call.path) console.log(chalk.gray(`   Path: ${call.path}`));
                if (call.command) console.log(chalk.magenta(`   Command: ${chalk.bold(call.command)}`));

                const { confirm } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: chalk.green('This action is flagged as sensitive. Allow?'),
                        default: false,
                        prefix: ''
                    }
                ]);

                if (!confirm) {
                    console.log(chalk.red('  ❌ Action denied by user.'));
                    return `TOOL_ERROR: User denied execution of sensitive tool ${call.tool}.`;
                }
            } else if (!isAutonomous) {
                // Si es seguro pero no es autónomo, también preguntamos (o podrías dejarlo pasar si prefieres)
                const { confirm } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: chalk.cyan(`Allow ${call.tool}?`),
                        default: true,
                        prefix: ''
                    }
                ]);
                if (!confirm) return `TOOL_ERROR: User denied execution.`;
            }

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
                case 'clear_terminal':
                    result = clearTerminal();
                    break;
                default:
                    result = `Unknown tool: ${call.tool}`;
            }

            // Guardar el detalle completo en el log
            const logContent = `TOOL: ${call.tool}\nINPUT: ${JSON.stringify(call, null, 2)}\n\nOUTPUT:\n${result}`;
            fs.writeFileSync(logPath, logContent);

            const link = `\x1b]8;;file://${logPath}\x1b\\[Ver Detalles]\x1b]8;;\x1b\\`;
            process.stdout.write(`${chalk.green('Done!')} ${chalk.cyan(link)}\n`);

            return `TOOL_RESULT: ${result}`;
        } catch (e) {
            return `TOOL_ERROR: Invalid JSON format or execution error.`;
        }
    };
    const handleCommand = async (cmd: string): Promise<boolean> => {
        const command = cmd.toLowerCase().trim();
        switch (command) {
            case '/exit':
                return true;
            case '/clear':
                console.clear();
                displayBanner();
                return false;
            case '/clear context':
                agent.clearHistory();
                console.log(chalk.yellow('\n  🧹 Context and history cleared.\n'));
                return false;
            case '/compact':
                compactMode = !compactMode;
                config.set('compactMode', compactMode);
                console.log(chalk.cyan(`\n  ✨ Compact mode: ${chalk.bold(compactMode ? 'ON' : 'OFF')}\n`));
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
            case '/help':
                console.log(chalk.cyan('\nAvailable Commands:'));
                console.log(styledCommand('/clear', 'Clear the terminal screen'));
                console.log(styledCommand('/clear context', 'Reset agent memory/history'));
                console.log(styledCommand('/compact', 'Toggle minimal output mode'));
                console.log(styledCommand('/config', 'Open configuration wizard'));
                console.log(styledCommand('/model <name>', 'Switch LLM model instantly'));
                console.log(styledCommand('/models', 'List available local models'));
                console.log(styledCommand('/skills', 'List active skills'));
                console.log(styledCommand('/update', 'Check for OpenShell updates'));
                console.log(styledCommand('/help', 'Show this help message'));
                console.log(styledCommand('/exit', 'Quit OpenShell\n'));
                return false;
            case '/update':
                console.log(chalk.yellow('\n  🔍 Checking for updates...'));
                try {
                    const { execSync } = await import('child_process');
                    execSync('git fetch');
                    const status = execSync('git status -uno').toString();
                    if (status.includes('Your branch is up to date')) {
                        console.log(chalk.green('  ✅ OpenShell is already at the latest version.\n'));
                    } else if (status.includes('Your branch is behind')) {
                        console.log(chalk.cyan('  🚀 A new update is available! Run "git pull" to update.\n'));
                    } else {
                        console.log(chalk.gray('  ℹ️  Custom branch detected. Manual update required.\n'));
                    }
                } catch (e) {
                    console.log(chalk.red('  ❌ Error checking for updates. Make sure you are in a Git repository.\n'));
                }
                return false;
            default:
                console.log(chalk.red(`Unknown command: ${cmd}. Type /help for assistance.`));
                return false;
        }
    };

    const commands = ['/help', '/clear', '/clear context', '/compact', '/config', '/model', '/models', '/skills', '/mcp', '/update', '/exit'];

    displayBanner();
    console.log(chalk.cyan('Welcome to OpenShell Chat! Type /help for commands, /exit to quit.\n'));
    console.log(chalk.gray(`Mode: ${compactMode ? 'Compact' : 'Normal'} | Provider: ${config.get('provider')} | Model: ${config.get('model')}\n`));

    while (true) {
        const { input } = await inquirer.prompt([
            {
                type: 'autocomplete',
                name: 'input',
                message: chalk.magenta('❯'),
                prefix: '',
                emptyText: 'No commands found',
                searchText: 'Searching...',
                source: (answers: any, input: string) => {
                    const currentInput = input || '';
                    if (currentInput.startsWith('/')) {
                        return Promise.resolve(commands.filter(c => c.startsWith(currentInput)));
                    }
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
                    if (compactMode) {
                        process.stdout.write(chalk.magenta('OpenShell: '));
                    } else {
                        displayResponseHeader();
                    }
                    i = -1;
                    // Guardar posición para poder limpiar si hay TOOL_CALL
                    process.stdout.write('\x1b[s'); 
                }
                process.stdout.write(token);
            });
            
            // Si la respuesta tiene herramientas, queremos limpiar los tokens crudos y mostrar algo bonito
            const cleanResponse = response.replace(/TOOL_CALL: \{.*?\}/g, '').trim();
            if (response.includes('TOOL_CALL:')) {
                if (cleanResponse) {
                    process.stdout.write('\x1b[u\x1b[J'); // Limpiar solo si hay algo nuevo que mostrar
                    process.stdout.write(marked.parse(cleanResponse) + '\n');
                }
            } else {
                // Si no hay herramientas, solo nos aseguramos de que haya un salto de línea al final
                process.stdout.write('\n');
            }
            
            // Ciclo de herramientas
            let toolResult = await handleToolCall(response);
            let callCount = 0;
            let currentMax = 2;

            while (toolResult) {
                if (callCount >= currentMax) {
                    const { continueWork } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'continueWork',
                            message: chalk.yellow(`⚠️  Limite de llamadas alcanzado (${currentMax}). ¿Seguir?`),
                            default: true
                        }
                    ]);

                    if (continueWork) {
                        callCount = 0; 
                        currentMax = 5; // Extender el límite en la siguiente ronda
                    } else {
                        console.log(chalk.red('\n🛑 Operación detenida por el usuario.'));
                        break;
                    }
                }

                callCount++;
                response = await agent.ask(toolResult);
                const nextCleanResponse = response.replace(/TOOL_CALL: \{.*?\}/g, '').trim();
                if (nextCleanResponse) {
                    process.stdout.write(marked.parse(nextCleanResponse) + '\n');
                }
                toolResult = await handleToolCall(response);
            }

            if (i !== -1 && loadingInterval) {
                clearInterval(loadingInterval);
            }

            // Detectar comandos bash
            const bashMatch = response.match(/```bash\n([\s\S]*?)```/);
            if (bashMatch && bashMatch[1]) {
                let commandToRun = bashMatch[1].trim();
                
                // SEGURIDAD: Si parece YAML o un intento de herramienta mal formateada, ignorar
                const isHallucinatedTool = commandToRun.includes('execute_command:') || 
                                         commandToRun.includes('parameters:') || 
                                         commandToRun.includes('command: "');
                
                if (isHallucinatedTool) {
                    continue; 
                }

                // Limpiar prefijos que la IA a veces añade por error
                commandToRun = commandToRun.replace(/^(\$|command|bash|cmd|sh):\s*/i, '').trim();
                commandToRun = commandToRun.replace(/^\$\s*/, '').trim(); // Asegurar eliminación de $
                
                const autonomousMode = config.get('autonomousMode');
                const isSafe = isSafeCommand(commandToRun);

                if (autonomousMode || isSafe) {
                    if (isSafe && !autonomousMode) {
                        console.log(chalk.gray(`  ⚡ Auto-executing safe command: ${chalk.white(commandToRun)}`));
                    } else {
                        console.log(chalk.yellow(`Executing suggested command: ${commandToRun}`));
                    }
                    
                    try {
                        execSync(commandToRun, { encoding: 'utf-8', stdio: 'inherit' });
                    } catch (e: any) {
                        console.error(chalk.red(`Command failed: ${e.message}`));
                    }
                } else {
                    const { confirm } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'confirm',
                            message: chalk.green(`Execute suggested command? (${chalk.bold(commandToRun)})`),
                            default: false,
                            prefix: ''
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
