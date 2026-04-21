import figlet from 'figlet';
import chalk from 'chalk';
import gradient from 'gradient-string';

export function displayBanner() {
    console.clear();
    const banner = figlet.textSync('OpenShell', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    });

    console.log(gradient.rainbow.multiline(banner));
    console.log(chalk.grey('─'.repeat(process.stdout.columns || 50)));
    console.log(chalk.bold(gradient.pastel('  🚀 OpenShell v2.0 - Premium AI Terminal by OpenGit')));
    console.log(chalk.grey('─'.repeat(process.stdout.columns || 50)) + '\n');
}

export function displayWelcome() {
    console.clear();
    const welcome = figlet.textSync('WELCOME', { font: 'Small' });
    console.log(gradient.cristal.multiline(welcome));
    console.log(chalk.bold.cyan('\n  🌟 Welcome to the OpenShell experience!'));
    console.log(chalk.white('  It seems this is your first time or you haven\'t configured an agent yet.'));
    console.log(chalk.white('  Let\'s set up your AI provider to begin your supercharged journey.\n'));
    console.log(chalk.grey('─'.repeat(process.stdout.columns || 50)) + '\n');
}

export function rainbowText(text: string) {
    return chalk.bold(gradient.rainbow(text));
}
