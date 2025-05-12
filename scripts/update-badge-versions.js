// update-badge-versions.js
import fs from 'fs';

// Badge config: name, npmName, link, logo, color
const badges = [
  { name: 'React', npm: 'react', link: 'https://react.dev', logo: 'react', color: '61DAFB' },
  { name: 'TypeScript', npm: 'typescript', link: 'https://www.typescriptlang.org', logo: 'typescript', color: '3178C6' },
  { name: 'Vite', npm: 'vite', link: 'https://vitejs.dev', logo: 'vite', color: '646CFF' },
  { name: 'XState', npm: 'xstate', link: 'https://xstate.js.org', logo: 'xstate', color: '121212' },
  { name: 'Konva', npm: 'konva', link: 'https://konvajs.org', logo: 'konva', color: '0DB7ED' },
  { name: 'Howler', npm: 'howler', link: 'https://howlerjs.com', logo: '', color: 'FF6600' },
];

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Read README.md
let readme = fs.readFileSync('README.md', 'utf8');

// Update each badge
for (const badge of badges) {
  const version = dependencies[badge.npm]?.replace(/^\D+/, '') || '';
  if (!version) continue;
  const badgeUrl = `https://img.shields.io/badge/${badge.name}-${version}-${badge.color}?style=flat-square${badge.logo ? `&logo=${badge.logo}` : ''}`;
  const badgeMd = `[![${badge.name}](${badgeUrl})](${badge.link})`;
  // More robust regex to match the full badge markdown (with any version, color, optional logo, and exact link)
  const badgeRegex = new RegExp(
    `\\[!\\[${badge.name}\\]\\(https://img\\.shields\\.io/badge/${badge.name}-[^-]+-[^?]+\\?style=flat-square(?:&logo=[^&\\)]*)?\\)\\]\\(${badge.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`,
    'g'
  );
  readme = readme.replace(badgeRegex, badgeMd);
}

// Write back to README.md
fs.writeFileSync('README.md', readme);

console.log('README badges updated successfully!');