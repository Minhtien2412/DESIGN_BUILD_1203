#!/usr/bin/env node
/**
 * Placeholder script for generating types from openapi/seed.yaml.
 * In a real environment you would install `openapi-typescript` and run:
 *   npx openapi-typescript openapi/seed.yaml -o types/openapi.d.ts
 */
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'openapi', 'seed.yaml');
const outDir = path.join(__dirname, '..', 'types');
const outFile = path.join(outDir, 'openapi.d.ts');

if (!fs.existsSync(input)) {
  console.error('Seed spec not found at', input);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Minimal placeholder types until real generation
const dts = `// AUTO-GENERATED PLACEHOLDER. Replace via openapi-typescript.
// Source: openapi/seed.yaml

export interface Project { id?: string; name?: string; status?: string }
export interface BidCreateRequest { project_id: string; amount: number; notes?: string; currency?: string }
`;
fs.writeFileSync(outFile, dts);
console.log('Wrote placeholder OpenAPI types to', outFile);
