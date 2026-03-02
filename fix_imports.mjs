import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk(srcDir);

const componentMoves = {
    'AppShell': 'layout',
    'CodexDashboard': 'dashboard',
    'CharacterForm': 'character',
    'CharacterList': 'character',
    'CharacterWizard': 'character',
    'LocationForm': 'location',
    'LocationList': 'location',
    'LoreLists': 'dashboard',
    'OceanRadarChart': 'character',
    'SearchBar': 'shared',
    'SlideOver': 'shared',
    'WorldRuleForm': 'world-rule',
    'WorldRuleList': 'world-rule'
};

files.forEach(file => {
    // Only modify UI component files, tests, and App.tsx
    if (!file.includes('ui\\\\components') && !file.includes('ui/components') && !file.endsWith('App.tsx')) return;

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const isTest = file.includes('__tests__') || file.includes('test.tsx');
    const isApp = file.endsWith('App.tsx');

    if (isTest) {
        for (const [comp, folder] of Object.entries(componentMoves)) {
            const regex1 = new RegExp(`from ['"]\\.\\.\\/${comp}['"]`, 'g');
            content = content.replace(regex1, `from '../${folder}/${comp}'`);
            
            const regex2 = new RegExp(`from ['"]\\.\\/${comp}['"]`, 'g');
            content = content.replace(regex2, `from '../${folder}/${comp}'`);
            
            const regex3 = new RegExp(`from ['"]\\.\\/ui\\/components\\/${comp}['"]`, 'g');
            content = content.replace(regex3, `from './ui/components/${folder}/${comp}'`);
        }
    } else if (isApp) {
        for (const [comp, folder] of Object.entries(componentMoves)) {
            const regex = new RegExp(`ui\\/components\\/${comp}`, 'g');
            content = content.replace(regex, `ui/components/${folder}/${comp}`);
        }
    } else {
        // Normal component in a subfolder
        // Relative sibling imports
        for (const [comp, folder] of Object.entries(componentMoves)) {
            const regex = new RegExp(`from ['"]\\.\\/${comp}['"]`, 'g');
            const targetFolder = folder;
            const currentFolder = path.basename(path.dirname(file));
            
            if (currentFolder === targetFolder) {
                // same folder now
                content = content.replace(regex, `from './${comp}'`);
            } else {
                // different folder
                content = content.replace(regex, `from '../${folder}/${comp}'`);
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
