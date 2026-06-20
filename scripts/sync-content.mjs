import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'content');
const target = path.join(root, 'public', 'content');
const sections = ['image', 'video', 'audio', 'chat'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    ensureDir(dest);
    return;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

ensureDir(source);
ensureDir(target);
for (const section of sections) {
  copyRecursive(path.join(source, section), path.join(target, section));
}
