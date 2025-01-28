import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Change to 'localhost' or another host if needed
    port: 3000,      // Specify the port you want to use, e.g., 3000
  },
});
