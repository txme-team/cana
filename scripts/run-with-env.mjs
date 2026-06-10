#!/usr/bin/env node
// .env.local을 주어진 env 파일 내용으로 임시 교체한 뒤 명령을 실행하고,
// 종료 시(정상/Ctrl+C/에러 모두) 원래 .env.local로 복원한다.
// 이렇게 해야 Next.js의 ".env.local 항상 최우선 병합" 동작 때문에
// prod 실행 중 local 값이 섞여 들어가는 걸 막을 수 있다.
import { existsSync, copyFileSync, renameSync, unlinkSync } from 'node:fs';
import { spawn } from 'node:child_process';

const [, , envFile, ...cmd] = process.argv;

const LOCAL = '.env.local';
const BACKUP = '.env.local.bak';

if (!envFile || cmd.length === 0) {
  console.error('Usage: node scripts/run-with-env.mjs <env-file> <command...>');
  process.exit(1);
}

if (!existsSync(envFile)) {
  console.error(`env file not found: ${envFile}`);
  process.exit(1);
}

// 이전 실행이 비정상 종료해 백업이 남아있으면 먼저 복구
if (existsSync(BACKUP)) {
  if (existsSync(LOCAL)) unlinkSync(LOCAL);
  renameSync(BACKUP, LOCAL);
}

const hadLocal = existsSync(LOCAL);
if (hadLocal) renameSync(LOCAL, BACKUP);
copyFileSync(envFile, LOCAL);

const restore = () => {
  if (existsSync(LOCAL)) unlinkSync(LOCAL);
  if (hadLocal) renameSync(BACKUP, LOCAL);
};

// spawnSync는 동기 블로킹이라, 부모가 SIGINT/SIGTERM을 받아도
// 이벤트 루프가 막혀 있어 핸들러가 실행되지 않고 .env.local이
// 복구되지 못한 채 죽어버린다. 비동기 spawn으로 자식을 띄우고,
// 부모가 받은 시그널을 자식에게 전달한 뒤 자식 종료를 기다려 복구한다.
let restored = false;
const restoreOnce = () => {
  if (restored) return;
  restored = true;
  restore();
};

const child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', shell: process.platform === 'win32' });

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    child.kill(sig);
  });
}

child.on('exit', (code, signal) => {
  restoreOnce();
  process.exit(signal ? 1 : (code ?? 0));
});
