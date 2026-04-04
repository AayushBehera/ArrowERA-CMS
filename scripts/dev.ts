#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('Starting dev server...');
execSync('npm run dev', { stdio: 'inherit' });
