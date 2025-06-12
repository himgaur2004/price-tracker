const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build frontend
console.log('Building frontend...');
try {
    // Change to frontend directory
    process.chdir(path.join(__dirname, 'frontend'));
    console.log('Installing frontend dependencies...');
    execSync('npm install --force', { stdio: 'inherit' });
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir(__dirname);
    console.log('Frontend build completed successfully');
} catch (error) {
    console.error('Frontend build failed:', error);
    process.exit(1);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true });
    console.log('Cleaned existing public directory');
}
fs.mkdirSync(publicDir);
console.log('Created fresh public directory');

// Copy frontend dist to public directory
const frontendDistDir = path.join(__dirname, 'frontend', 'dist');
console.log('Copying from frontend dist:', frontendDistDir);
console.log('Copying to public directory:', publicDir);

function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.error('Source directory does not exist:', src);
        process.exit(1);
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    console.log(`Copying files from ${src}:`, entries.map(e => e.name));

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            console.log('Copying directory:', entry.name);
            copyDir(srcPath, destPath);
        } else {
            console.log('Copying file:', entry.name);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    copyDir(frontendDistDir, publicDir);

    // Create a _redirects file for SPA routing
    const redirectsPath = path.join(publicDir, '_redirects');
    fs.writeFileSync(redirectsPath, '/* /index.html 200');
    console.log('Created _redirects file for SPA routing');

    console.log('\nContents of public directory:');
    const publicContents = fs.readdirSync(publicDir, { withFileTypes: true });
    publicContents.forEach(item => {
        console.log(`- ${item.isDirectory() ? '[DIR]' : '[FILE]'} ${item.name}`);
    });
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} 