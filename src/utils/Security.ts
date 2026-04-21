/**
 * Determines if a command is "safe" to execute without explicit user confirmation.
 * Safe commands are generally read-only or create/modify non-critical files.
 */
export function isSafeCommand(command: string): boolean {
    const cmd = command.trim().toLowerCase();
    
    // Commands that are always safe (mostly read-only)
    const safeBaseCommands = [
        'ls', 'pwd', 'date', 'whoami', 'echo', 'cat', 'grep', 'find', 'locate',
        'df', 'du', 'free', 'uptime', 'ps', 'top', 'htop', 'git status', 'git branch', 'git log',
        'npm list', 'node -v', 'python --version', 'python3 --version', 'pip list',
        'mkdir', 'touch', 'cd'
    ];

    // Check if the command starts with a safe base command
    const isSafeBase = safeBaseCommands.some(base => {
        return cmd === base || cmd.startsWith(base + ' ');
    });

    if (!isSafeBase) return false;

    // Even if it starts with a safe command, block dangerous patterns
    const dangerousPatterns = [
        '> /etc/', '> /bin/', '> /sbin/', '> /boot/', '> /var/',
        'sudo', 'rm -rf /', 'chmod 777', 'chown', 'curl', 'wget', '| bash', '| sh'
    ];

    const hasDangerousPattern = dangerousPatterns.some(pattern => cmd.includes(pattern));

    return !hasDangerousPattern;
}
