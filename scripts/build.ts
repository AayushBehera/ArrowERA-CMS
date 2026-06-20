#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });
