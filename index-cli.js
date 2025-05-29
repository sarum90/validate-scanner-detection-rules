const core = require('@actions/core');
const { execSync } = require('child_process');
const glob = require('@actions/glob');
const path = require('path');

async function run() {
  try {
    const scannerApiBase = core.getInput('scanner_api_base', { required: true });
    const scannerApiKey = core.getInput('scanner_api_key', { required: true });
    const filePattern = core.getInput('file_pattern') || '**/*.yml';

    // Set environment variables for scanner-cli
    process.env.SCANNER_API_URL = scannerApiBase;
    process.env.SCANNER_API_KEY = scannerApiKey;

    core.info(`Scanning for YAML files with pattern: ${filePattern}`);

    const globber = await glob.create(filePattern, {
      followSymbolicLinks: false,
      implicitDescendants: true,
      omitBrokenSymbolicLinks: true
    });

    const yamlFiles = await globber.glob();
    core.info(`Found ${yamlFiles.length} YAML files`);
    
    if (yamlFiles.length === 0) {
      core.warning('No YAML files found. Check the file_pattern and ensure YAML files exist in the repository.');
      return;
    }

    let hasErrors = false;

    for (const filePath of yamlFiles) {
      try {
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Run scanner-cli validate command
        execSync(`scanner-cli validate -f "${filePath}"`, {
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf8'
        });
        
        core.info(`✅ ${relativePath} is valid`);
        
      } catch (error) {
        hasErrors = true;
        const relativePath = path.relative(process.cwd(), filePath);
        core.setFailed(`❌ ${relativePath} is invalid: ${error.stderr || error.message}`);
      }
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();