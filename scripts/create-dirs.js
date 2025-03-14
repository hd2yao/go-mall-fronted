import fs from 'fs';
import path from 'path';

const directories = [
  'src/api',
  'src/assets/images',
  'src/assets/styles',
  'src/assets/icons',
  'src/components/common',
  'src/components/business',
  'src/components/layout',
  'src/composables',
  'src/config',
  'src/directives',
  'src/hooks',
  'src/router',
  'src/stores',
  'src/types',
  'src/utils',
  'src/views/home',
  'src/views/user',
  'src/views/product',
  'src/views/cart',
  'src/views/order'
];

directories.forEach(dir => {
  const dirPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All directories created successfully!');
