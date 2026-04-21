import fs from 'fs';
import path from 'path';
import os from 'os';

export const OPEN_SHELL_DIR = path.join(os.homedir(), '.openshell');
export const SKILLS_DIR = path.join(OPEN_SHELL_DIR, 'skills');
export const CONTEXT_DIR = path.join(OPEN_SHELL_DIR, 'context');
export const MCP_DIR = path.join(OPEN_SHELL_DIR, 'mcp');
export const AUTO_DIR = path.join(OPEN_SHELL_DIR, 'automations');
export const LOCAL_SKILLS_DIR = path.join(process.cwd(), 'skills');

export function ensureDirectories() {
    const dirs = [OPEN_SHELL_DIR, SKILLS_DIR, CONTEXT_DIR, MCP_DIR, AUTO_DIR];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Crear habilidad por defecto si no existe
    const defaultSkillPath = path.join(SKILLS_DIR, 'default.md');
    if (!fs.existsSync(defaultSkillPath)) {
        const content = `# OpenShell Core Skills
- **Navigation**: Always verify the current directory before suggesting file operations.
- **Safety**: Do not suggest deleting system files or sensitive directories like /etc, /boot, or hidden system files unless explicitly asked.
- **Tool Usage**: Use \`ls\`, \`cat\`, \`grep\`, and \`find\` to understand the environment.
- **Context**: When the user mentions a file with @[filename], assume you have access to its content.
- **Internet**: If asked to search the internet, explain that you are a local agent but can provide information based on your training or analyze local documentation.
`;
        fs.writeFileSync(defaultSkillPath, content);
    }
}

export function getModelContextDir(modelName: string): string {
    const modelDir = path.join(CONTEXT_DIR, modelName.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }
    return modelDir;
}

export function getSkillsSummary(): string {
    const summaries: string[] = [];
    
    const findSummaries = (dir: string) => {
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
                    summaries.push(`- ${name}: ${desc} (Location: ${fullPath})`);
                } else {
                    findSummaries(fullPath);
                }
            } else if (item.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const title = content.split('\n')[0]?.replace('#', '').trim() || item;
                summaries.push(`- ${title} (Location: ${fullPath})`);
            }
        }
    };

    findSummaries(SKILLS_DIR);
    findSummaries(LOCAL_SKILLS_DIR);

    return summaries.join('\n');
}

export function readSkills(): string[] {
    // Mantener por compatibilidad pero usar getSkillsSummary para el prompt
    return [];
}
