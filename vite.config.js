import {defineConfig} from 'vite';
export default defineConfig({base:'./',esbuild:{jsx:'transform',jsxFactory:'__localizedElement',jsxFragment:'React.Fragment'},build:{target:'es2022',assetsInlineLimit:1000000,cssCodeSplit:false},server:{host:'127.0.0.1'}});
