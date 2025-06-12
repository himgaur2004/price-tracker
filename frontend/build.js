import { execSync } from 'child_process';
import { rmSync } from 'fs';

try {
    // Clean up only what's necessary
    console.log('Cleaning up...');
    try {
        rmSync('./dist', { recursive: true, force: true });
    } catch (e) {
        console.log('Clean up skipped:', e.message);
    }

    // Install dependencies only if node_modules doesn't exist
    if (!require('fs').existsSync('node_modules')) {
        console.log('Installing dependencies...');
        execSync('npm install --no-audit --prefer-offline', { stdio: 'inherit' });
    } else {
        console.log('Using existing node_modules...');
    }

    // Build with optimization flags
    console.log('Building...');
    execSync('npm run build -- --mode production --emptyOutDir=false', { stdio: 'inherit' });

    console.log('Build completed successfully!');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} 