import chalk from 'chalk';

export function showDiffSummary(oldContent: string, newContent: string) {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    let added = 0;
    let removed = 0;
    
    // Simulación simple de diff (esto se puede mejorar con librerías de diff reales)
    removed = oldLines.length;
    added = newLines.length;

    console.log(chalk.bold('\n📊 Change Summary:'));
    console.log(chalk.red(`  - ${removed} lines removed`));
    console.log(chalk.green(`  + ${added} lines added`));
    console.log(chalk.grey('───────────────────\n'));
}
