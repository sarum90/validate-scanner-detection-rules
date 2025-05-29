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
    
    if (yamlFiles.length === 0) {
      core.warning('No YAML files found. Check the file_pattern and ensure YAML files exist in the repository.');
      return;
    }

    // Build command with all files
    const fileArgs = yamlFiles.map(file => `-f "${file}"`).join(' ');
    const command = `scanner-cli validate ${fileArgs}`;

    try {
      const result = execSync(command, {
        encoding: 'utf8'
      });
      
      // If we get here, all files are valid
      core.info(result);
      
    } catch (error) {
      // Show full stdout output
      if (error.stdout) {
        core.info(error.stdout);
      }
      
      // Parse stdout to create individual file annotations
      if (error.stdout) {
        const lines = error.stdout.split('\n');
        for (const line of lines) {
          // Look for lines with format: <filepath>: <error>
          const match = line.match(/^(.+?): (.+)$/);
          if (match) {
            const [, filePath, errorMsg] = match;
            const relativePath = path.relative(process.cwd(), filePath);
            core.error(`${relativePath}: ${errorMsg}`);
          }
        }
      }
      
      // Set overall failure with stderr details
      core.setFailed(error.stderr || 'Detection rule validation failed');
      return; // Exit gracefully, let core.setFailed handle the failure
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();