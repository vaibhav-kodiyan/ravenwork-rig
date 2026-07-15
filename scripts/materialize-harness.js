#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const RULE_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
];

const HOST_ADAPTERS = {
  agents: ['.agents/rules/ponytail.md'],
  cline: ['.clinerules/ponytail.md'],
  cursor: ['.cursor/rules/ponytail.mdc'],
  gemini: ['gemini-extension.json'],
  'github-copilot': [
    '.github/copilot-instructions.md',
    '.github/plugin/plugin.json',
    '.github/plugin/marketplace.json',
  ],
  kiro: ['.kiro/steering/ponytail.md'],
  opencode: ['.opencode/command'],
  windsurf: ['.windsurf/rules/ponytail.md'],
};

function parseArgs(argv) {
  const args = {
    source: ROOT,
    target: process.cwd(),
    manifest: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source') args.source = path.resolve(argv[++i]);
    else if (arg === '--target') args.target = path.resolve(argv[++i]);
    else if (arg === '--manifest') args.manifest = path.resolve(argv[++i]);
    else throw new Error(`unknown argument: ${arg}`);
  }

  args.manifest = args.manifest || path.join(args.target, 'harness', 'manifest.json');
  return args;
}

function readManifest(file) {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (manifest.schemaVersion !== 1) {
    throw new Error(`unsupported harness schemaVersion: ${manifest.schemaVersion}`);
  }
  if (!Array.isArray(manifest.decisions)) {
    throw new Error('harness manifest must contain decisions[]');
  }
  return manifest;
}

function enabled(manifest, id) {
  return manifest.decisions.find((decision) => decision.id === id && decision.enabled !== false);
}

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function copyPath(sourceRoot, targetRoot, relPath) {
  const from = path.join(sourceRoot, relPath);
  const to = path.join(targetRoot, relPath);
  const stat = fs.statSync(from);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(from)) {
      copyPath(sourceRoot, targetRoot, path.join(relPath, entry));
    }
    return;
  }

  mkdirFor(to);
  fs.copyFileSync(from, to);
}

function writeEnvExample(targetRoot, secrets = {}) {
  const envFile = secrets.envFile || '.env';
  const exampleFile = secrets.exampleFile || '.env.example';
  const keys = Array.isArray(secrets.keys) ? secrets.keys : [];
  const lines = [
    '# Copy to .env (gitignored) and fill in locally. Never commit real secrets.',
    ...keys.map((key) => `${key}=`),
    '',
  ];

  const examplePath = path.join(targetRoot, exampleFile);
  mkdirFor(examplePath);
  fs.writeFileSync(examplePath, lines.join('\n'));
  ensureGitignoreLine(targetRoot, envFile);
}

function ensureGitignoreLine(targetRoot, line) {
  const gitignore = path.join(targetRoot, '.gitignore');
  let body = '';
  try {
    body = fs.readFileSync(gitignore, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const lines = body.split(/\r?\n/).filter(Boolean);
  if (!lines.includes(line)) {
    const next = body && !body.endsWith('\n') ? `${body}\n${line}\n` : `${body}${line}\n`;
    fs.writeFileSync(gitignore, next);
  }
}

function materialize({ source, target, manifest }) {
  const config = readManifest(manifest);
  const copied = [];

  if (enabled(config, 'tier1.markdown-rules')) {
    for (const relPath of RULE_FILES) {
      copyPath(source, target, relPath);
      copied.push(relPath);
    }
  }

  if (enabled(config, 'tier1.skills')) {
    copyPath(source, target, 'skills');
    copied.push('skills');
  }

  if (enabled(config, 'tier1.commands')) {
    copyPath(source, target, 'commands');
    copied.push('commands');
  }

  const hostDecision = enabled(config, 'tier1.host-adapters');
  if (hostDecision) {
    for (const host of hostDecision.hosts || []) {
      if (!HOST_ADAPTERS[host]) throw new Error(`unknown host adapter: ${host}`);
      for (const relPath of HOST_ADAPTERS[host]) {
        copyPath(source, target, relPath);
        copied.push(relPath);
      }
    }
  }

  writeEnvExample(target, config.secrets);
  return copied;
}

if (require.main === module) {
  try {
    const copied = materialize(parseArgs(process.argv.slice(2)));
    console.log(`materialized ${copied.length} harness entries`);
  } catch (error) {
    console.error(`materialize-harness: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { materialize, parseArgs, readManifest };
