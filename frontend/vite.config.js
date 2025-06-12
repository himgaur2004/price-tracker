import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@mui/material', '@emotion/react', '@emotion/styled']
                }
            }
        },
        cache: true,
        chunkSizeWarningLimit: 1000,
        cssCodeSplit: true,
        assetsInlineLimit: 4096
    },
    define: {
        'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://web-production-81e32.up.railway.app'),
        'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://web-production-81e32.up.railway.app/api')
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
        exclude: ['@mui/icons-material']
    }
}); 