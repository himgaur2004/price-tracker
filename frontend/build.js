import { execSync } from 'child_process';
import { rmSync } from 'fs';

try {
    // Clean up
    console.log('Cleaning up...');
    try {
        rmSync('./dist', { recursive: true, force: true });
        rmSync('./node_modules/.vite', { recursive: true, force: true });
    } catch (e) {
        console.log('Clean up skipped:', e.message);
    }

    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Build
    console.log('Building...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('Build completed successfully!');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} 