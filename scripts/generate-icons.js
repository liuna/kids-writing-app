// SVG 图标生成脚本
// 生成简单的文字图标

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 192x192 图标 SVG
const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect fill="#F4A460" width="192" height="192"/>
  <rect x="10" y="10" width="172" height="172" rx="20" fill="#FDF5E6"/>
  <text x="96" y="130" text-anchor="middle" font-family="KaiTi, serif" font-size="100" fill="#333">字</text>
</svg>`;

// 512x512 图标 SVG
const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect fill="#F4A460" width="512" height="512"/>
  <rect x="28" y="28" width="456" height="456" rx="48" fill="#FDF5E6"/>
  <text x="256" y="350" text-anchor="middle" font-family="KaiTi, serif" font-size="280" fill="#333">字</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), icon512);

console.log('Icons generated successfully!');
console.log('- public/icons/icon-192x192.svg');
console.log('- public/icons/icon-512x512.svg');
