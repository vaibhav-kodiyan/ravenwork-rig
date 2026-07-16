#!/usr/bin/env node
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { materialize, readManifest } = require('../scripts/materialize-harness');

const root = path.join(__dirname, '..');

function tmpTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-harness-'));
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('harness manifest is a decision list with a pinned source ref', () => {
  const manifest = readManifest(path.join(root, 'harness', 'manifest.json'));
  assert.equal(manifest.schemaVersion, 1);
  assert.match(manifest.harnessVersion, /^\d+\.\d+\.\d+$/);
  assert.match(manifest.source.ref, /^v\d+\.\d+\.\d+$/);
  assert.ok(Array.isArray(manifest.decisions));
  assert.ok(manifest.decisions.some((decision) => decision.id === 'tier1.markdown-rules'));
  assert.ok(manifest.decisions.some((decision) => decision.id === 'tier1.host-adapters'));
  assert.ok(manifest.decisions.every((decision) => !Object.hasOwn(decision, 'files')));
});

test('materializer installs Tier 1 rules, skills, commands, adapters, and blank secret placeholders', () => {
  const target = tmpTarget();
  try {
    const copied = materialize({
      source: root,
      target,
      manifest: path.join(root, 'harness', 'manifest.json'),
    });

    assert.ok(copied.includes('skills'));
    assert.ok(copied.includes('commands'));
    assert.equal(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), read('AGENTS.md'));
    assert.equal(
      fs.readFileSync(path.join(target, '.cursor/rules/ponytail.mdc'), 'utf8'),
      read('.cursor/rules/ponytail.mdc'),
    );
    assert.equal(
      fs.readFileSync(path.join(target, 'skills/ponytail/SKILL.md'), 'utf8'),
      read('skills/ponytail/SKILL.md'),
    );
    assert.equal(
      fs.readFileSync(path.join(target, 'commands/ponytail.toml'), 'utf8'),
      read('commands/ponytail.toml'),
    );
    assert.equal(
      fs.readFileSync(path.join(target, 'gemini-extension.json'), 'utf8'),
      read('gemini-extension.json'),
    );

    const envExample = fs.readFileSync(path.join(target, '.env.example'), 'utf8');
    assert.doesNotMatch(envExample, /sk-[a-z0-9-]+/i);
    assert.match(fs.readFileSync(path.join(target, '.gitignore'), 'utf8'), /^\.env$/m);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('materializer is idempotent', () => {
  const target = tmpTarget();
  try {
    const args = {
      source: root,
      target,
      manifest: path.join(root, 'harness', 'manifest.json'),
    };
    materialize(args);
    const before = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
    const gitignoreBefore = fs.readFileSync(path.join(target, '.gitignore'), 'utf8');

    materialize(args);

    assert.equal(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), before);
    assert.equal(fs.readFileSync(path.join(target, '.gitignore'), 'utf8'), gitignoreBefore);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});
