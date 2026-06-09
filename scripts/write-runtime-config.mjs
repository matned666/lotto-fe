import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const backendUrl = process.env.LOTTO_CHECK_API_URL ?? 'http://localhost:8080';
const target = join('public', 'assets', 'app-config.json');

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify({ backendUrl }, null, 2)}\n`);
