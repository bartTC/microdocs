/**
 * Build a microdocs HTML fixture for Playwright tests.
 *
 * Steps:
 * 1. Run the regular template build (handled by npm script).
 * 2. Run the Python CLI against fixture markdown to emit `playwright-fixtures/default.html`.
 */
import { execSync } from 'child_process';
import { mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesDir = resolve(__dirname, 'fixtures');
const outputDir = resolve(__dirname, '..', 'playwright-fixtures');
const templatesDir = resolve(__dirname, '..', 'microdocs', 'templates');

mkdirSync(outputDir, { recursive: true });

const markdownFiles = ['README.md', 'GUIDE.md', 'CHANGELOG.md'].map(
  (file) => `"${resolve(fixturesDir, file)}"`
);

// Get all template directories
const templates = readdirSync(templatesDir).filter(file => {
  return statSync(resolve(templatesDir, file)).isDirectory();
});

templates.forEach(templateName => {
  const templatePath = resolve(templatesDir, templateName, `${templateName}.html`);
  const outputFile = resolve(outputDir, `${templateName}.html`);

  // Skip if template HTML doesn't exist (e.g. partials or misconfigured dirs)
  try {
    statSync(templatePath);
  } catch (e) {
    console.warn(`Skipping ${templateName}: ${templateName}.html not found`);
    return;
  }

  const command = [
    'python',
    '-m',
    'microdocs',
    ...markdownFiles,
    '-o',
    `"${outputFile}"`,
    '--template',
    `"${templatePath}"`,
    '--title',
    `"${templateName} Template Playwright Test"`,
  ];

  console.log(`Building Playwright fixture for ${templateName}...`);
  try {
    execSync(command.join(' '), { stdio: 'inherit' });
    console.log(`✓ Generated ${outputFile}`);
  } catch (error) {
    console.error(`✗ Failed to build ${templateName}`);
    process.exit(1);
  }
});
