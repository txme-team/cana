import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const errors = [];
const canaOwnedAppFiles = ['icon.png', 'icon.svg', 'robots.ts', 'sitemap.ts'];
const nextConfig = await readFile(path.join(projectRoot, 'next.config.mjs'), 'utf8');
const gitignore = await readFile(path.join(projectRoot, '.gitignore'), 'utf8');
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));

async function childNames(relativePath) {
  return (await readdir(path.join(projectRoot, relativePath), { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => ({ name: entry.name, isDirectory: entry.isDirectory() }));
}

async function sourceFiles(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await sourceFiles(childRelativePath));
    } else if (/\.(?:js|jsx|mjs|ts|tsx)$/.test(entry.name)) {
      files.push(childRelativePath);
    }
  }

  return files;
}

const apiChildren = await childNames('app/api');
for (const entry of apiChildren) {
  if (!entry.isDirectory || entry.name !== 'rotation') {
    errors.push(`app/api/${entry.name}: Rotation API는 app/api/rotation 아래에만 둘 수 있습니다.`);
  }
}

const allowedAppDirectories = new Set(['api', 'fonts', 'rotation']);
for (const entry of await childNames('app')) {
  if (entry.isDirectory && !allowedAppDirectories.has(entry.name)) {
    errors.push(`app/${entry.name}: 새 화면은 app/rotation 아래에 만들어야 합니다.`);
  }
}

for (const entry of await childNames('app')) {
  if (!entry.isDirectory && canaOwnedAppFiles.includes(entry.name)) {
    errors.push(`app/${entry.name}: 루트 공개 파일은 Lightsail의 Cana가 소유합니다.`);
  }
}

for (const entry of await childNames('public')) {
  if (!entry.isDirectory || entry.name !== 'txme-assets') {
    errors.push(`public/${entry.name}: txme 정적 자산은 public/txme-assets 아래에만 둘 수 있습니다.`);
  }
}

const filesToScan = [
  ...await sourceFiles('app'),
  ...await sourceFiles('components'),
  ...await sourceFiles('lib'),
];

const vercelConfig = JSON.parse(await readFile(path.join(projectRoot, 'vercel.json'), 'utf8'));
if ((vercelConfig.crons?.length ?? 0) > 0) {
  errors.push('vercel.json: Hobby 플랜에서는 Vercel Cron 대신 기존 cron-job.org를 사용합니다.');
}

const legacyAssetPattern = /["'`]\/(?:hero|images|icons|logos|rotation-assets|landing-assets|fonts)(?:\/|["'`])|["'`]\/logo-text-/g;
const legacyApiPattern = /["'`]\/api\/(?!rotation(?:\/|["'`]))/g;
const legacyWaitlistApplyPattern = /(?:["'`}]|\$\{[^}]+\})\/apply\?eventId=/g;

for (const relativePath of filesToScan) {
  const source = await readFile(path.join(projectRoot, relativePath), 'utf8');
  if (legacyAssetPattern.test(source)) {
    errors.push(`${relativePath}: 정적 자산 URL은 /txme-assets/*를 사용해야 합니다.`);
  }
  legacyAssetPattern.lastIndex = 0;

  if (legacyApiPattern.test(source)) {
    errors.push(`${relativePath}: Rotation API URL은 /api/rotation/*를 사용해야 합니다.`);
  }
  legacyApiPattern.lastIndex = 0;

  if (legacyWaitlistApplyPattern.test(source)) {
    errors.push(`${relativePath}: 대기자 안내 URL은 /rotation/apply를 사용해야 합니다.`);
  }
  legacyWaitlistApplyPattern.lastIndex = 0;
}

for (const redirect of [
  "{ source: '/home', destination: 'https://cana.im/home', permanent: false }",
  "{ source: '/terms', destination: 'https://cana.im/terms', permanent: false }",
  "{ source: '/privacy', destination: 'https://cana.im/privacy', permanent: false }",
]) {
  if (!nextConfig.includes(redirect)) {
    errors.push(`next.config.mjs: Vercel 직접 접속용 Cana redirect가 없습니다: ${redirect}`);
  }
}

if (!gitignore.split(/\r?\n/).includes('.env')) {
  errors.push('.gitignore: 로컬 .env 파일을 반드시 제외해야 합니다.');
}

if (packageJson.scripts?.prebuild !== 'npm run check:gateway') {
  errors.push('package.json: Vercel build 전에 check:gateway가 실행되어야 합니다.');
}

if (errors.length > 0) {
  console.error('Gateway boundary check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Gateway boundaries are valid.');
