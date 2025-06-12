const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

// Copy frontend files to public directory
const frontendDir = path.join(__dirname, 'frontend');
const publicDir = path.join(__dirname, 'public');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    copyDir(frontendDir, publicDir);
    console.log('Build completed successfully - files copied to public directory');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} 