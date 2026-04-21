/**
 * Determines if a command is "safe" to execute without explicit user confirmation.
 * Safe commands are generally read-only or create/modify non-critical files.
 */
/**
 * Sensitive files and directories that should never be accessed without confirmation.
 */
const SENSITIVE_PATTERNS = [
    '.env',
    '.git/',
    'node_modules/',
    'package-lock.json',
    '.npmrc',
    '.ssh/',
    '.aws/',
    '.kube/',
    '.bash_history',
    '.zsh_history',
    '.config/', // Block all config files by default to be safe
    'history.json' // OpenShell's own history
];

/**
 * Determines if a file path is sensitive.
 */
export function isSensitivePath(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    
    // Check for sensitive patterns
    if (SENSITIVE_PATTERNS.some(pattern => normalizedPath.includes(pattern.toLowerCase()))) {
        return true;
    }

    // Block hidden files or directories (starting with dot)
    const segments = normalizedPath.split('/');
    if (segments.some(segment => segment.startsWith('.') && segment !== '.' && segment !== '..')) {
        return true;
    }

    return false;
}

/**
 * Determines if a command is "safe" to execute without explicit user confirmation.
 * Safe commands are generally read-only or create/modify non-critical files.
 */
export function isSafeCommand(command: string): boolean {
    const cmd = command.trim().toLowerCase();
    
    // Commands that are always safe (mostly read-only)
    const safeBaseCommands = [
        'ls', 'pwd', 'date', 'whoami', 'echo', 'find', 'locate',
        'df', 'du', 'free', 'uptime', 'ps', 'top', 'htop', 'git status', 'git branch', 'git log',
        'npm list', 'node -v', 'python --version', 'python3 --version', 'pip list',
        'mkdir', 'touch', 'cd'
    ];

    // cat and grep are safe ONLY if they don't target sensitive files
    const conditionalSafeCommands = ['cat', 'grep', 'head', 'tail', 'less', 'more'];

    // Check if the command starts with a safe base command
    const isSafeBase = safeBaseCommands.some(base => {
        return cmd === base || cmd.startsWith(base + ' ');
    });

    const isConditionalSafe = conditionalSafeCommands.some(base => {
        return cmd === base || cmd.startsWith(base + ' ');
    });

    if (!isSafeBase && !isConditionalSafe) return false;

    // Patrones de comandos o rutas que requieren confirmación manual extra
    const sensitivePatterns = [
        /\.aws/, /\.kube/, /\.ssh/, /\.config/, /\.env/,
        /rm -rf/, /mkfs/, /dd if=/, /> \/dev\/sd/,
        /sudo\s+/, /apt\s+/, /install\s+/, /pacman\s+/, /yum\s+/, /dnf\s+/,
        /chmod/, /chown/
    ];

    // Even if it starts with a safe command, block dangerous patterns
    const dangerousPatterns = [
        '> /etc/', '> /bin/', '> /sbin/', '> /boot/', '> /var/',
        'sudo ', 'rm -rf ', 'chmod ', 'chown ', 'curl ', 'wget ', '| bash', '| sh',
        'nc ', 'netcat ', 'nmap ', 'perl ', 'python -c', 'eval '
    ];

    const hasDangerousPattern = dangerousPatterns.some(pattern => cmd.includes(pattern)) || 
                                sensitivePatterns.some(regex => regex.test(cmd));
    if (hasDangerousPattern) return false;

    // For conditional safe commands, check if they target sensitive files
    if (isConditionalSafe || isSafeBase) {
        if (SENSITIVE_PATTERNS.some(pattern => cmd.includes(pattern.toLowerCase()))) {
            return false;
        }
        
        // Also check for hidden files in the command arguments
        const words = cmd.split(/\s+/);
        for (const word of words) {
            if (word.startsWith('.') && word.length > 1 && !['./', '../'].some(p => word.startsWith(p))) {
                return false;
            }
        }
    }

    return true;
}
