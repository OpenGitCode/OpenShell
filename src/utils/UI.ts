import figlet from 'figlet';
import chalk from 'chalk';
import gradient from 'gradient-string';

export function displayBanner() {
    console.clear();
    const purpleGradient = gradient(['#8A2BE2', '#9370DB', '#E066FF', '#BA55D3']);
    const banner = figlet.textSync('OpenShell', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    });

    console.log(purpleGradient.multiline(banner));
    console.log(chalk.magenta('─'.repeat(process.stdout.columns || 50)));
    console.log(chalk.bold(purpleGradient('  🚀 OpenShell v2.0 - Premium AI Terminal by OpenGit')));
    console.log(chalk.magenta('─'.repeat(process.stdout.columns || 50)) + '\n');
}

export function displayWelcome() {
    console.clear();
    const purpleGradient = gradient(['#8A2BE2', '#DA70D6']);
    const welcome = figlet.textSync('WELCOME', { font: 'Small' });
    console.log(purpleGradient.multiline(welcome));
    console.log(chalk.bold.magenta('\n  🌟 Welcome to the OpenShell experience!'));
    console.log(chalk.white('  It seems this is your first time or you haven\'t configured an agent yet.'));
    console.log(chalk.white('  Let\'s set up your AI provider to begin your supercharged journey.\n'));
    console.log(chalk.magenta('─'.repeat(process.stdout.columns || 50)) + '\n');
}

export function rainbowText(text: string) {
    return chalk.bold(gradient(['#8A2BE2', '#E066FF'])(text));
}

export function displayResponseHeader(agentName: string = 'OpenShell') {
    const time = new Date().toLocaleTimeString();
    const purpleLine = gradient(['#8A2BE2', '#BA55D3']);
    process.stdout.write(`\n${purpleLine('╭─')} ${chalk.bold.magenta(agentName)} ${chalk.magenta('─')} ${chalk.dim(time)}\n${purpleLine('╰')}${chalk.magenta(' ❯ ')} `);
}

export function styledCommand(cmd: string, desc: string) {
    return `  ${rainbowText(cmd.padEnd(12))} ${chalk.white('─')} ${chalk.grey(desc)}`;
}
