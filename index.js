const core = require('@actions/core');
const glob = require('@actions/glob');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  try {
    const scannerApiBase = core.getInput('scanner_api_base', { required: true });
    const scannerApiKey = core.getInput('scanner_api_key', { required: true });
    const filePattern = core.getInput('file_pattern') || '**/*.yml';

    const endpointUrl = `${scannerApiBase}/v1/detection_rule_yaml/validate`;

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

    for (const filePath of yamlFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        const headers = {
          'Content-Type': 'text/yaml',
          'User-Agent': 'GitHub-Action-Detection-Rule-Validator',
          'Authorization': `Bearer ${scannerApiKey}`
        };

        
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: headers,
          body: content
        });
          
        if (!response.ok) {
          const responseBody = await response.text();
          core.error(`Failed to validate ${relativePath}: ${response.status} ${response.statusText} - ${responseBody}`);
        } else {
          const responseBody = await response.json();
          
          if (responseBody.is_valid) {
            core.info(`✅ ${relativePath} is valid`);
            if (responseBody.warning) {
              core.warning(`Warning for ${relativePath}: ${responseBody.warning}`);
            }
          } else {
            core.setFailed(`❌ ${relativePath} is invalid: ${responseBody.error}`);
            if (responseBody.warning) {
              core.warning(`Warning for ${relativePath}: ${responseBody.warning}`);
            }
          }
        }

      } catch (error) {
        core.setFailed(`Error processing ${filePath}: ${error.message}`);
      }
    }


  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
