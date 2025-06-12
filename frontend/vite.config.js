import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'https://web-production-81e32.up.railway.app',
                changeOrigin: true,
                secure: true,
                ws: true
            }
        },
    },
    define: {
        'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://web-production-81e32.up.railway.app'),
        'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://web-production-81e32.up.railway.app/api')
    },
    esbuild: {
        loader: 'jsx',
        include: /\.[jt]sx?$/,
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    ui: ['@mui/material', '@emotion/react', '@emotion/styled']
                }
            }
        }
    }
}); 