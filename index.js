const core = require('@actions/core');
const glob = require('@actions/glob');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  try {
    const endpointUrl = core.getInput('endpoint_url', { required: true });
    const authHeader = core.getInput('auth_header');
    const filePattern = core.getInput('file_pattern') || '**/*.{yml,yaml}';

    core.info(`Scanning for YAML files with pattern: ${filePattern}`);
    core.info(`Endpoint URL: ${endpointUrl}`);
    core.info(`Working directory: ${process.cwd()}`);

    const globber = await glob.create(filePattern, {
      followSymbolicLinks: false,
      implicitDescendants: true,
      omitBrokenSymbolicLinks: true
    });

    const yamlFiles = await globber.glob();
    core.info(`Found ${yamlFiles.length} YAML files`);
    
    if (yamlFiles.length === 0) {
      core.warning('No YAML files found. Check the file_pattern and ensure YAML files exist in the repository.');
    }
    
    yamlFiles.forEach(file => core.info(`Found file: ${file}`));

    for (const filePath of yamlFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        const headers = {
          'Content-Type': 'text/yaml',
          'User-Agent': 'GitHub-Action-Detection-Rule-Validator'
        };

        if (authHeader) {
          headers['Authorization'] = authHeader;
        }

        core.info(`Validating detection rule: ${relativePath}`);
        
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: headers,
          body: content
        });

        if (!response.ok) {
          core.warning(`Failed to post ${relativePath}: ${response.status} ${response.statusText}`);
        } else {
          core.info(`Successfully posted ${relativePath}`);
        }

      } catch (error) {
        core.warning(`Error processing ${filePath}: ${error.message}`);
      }
    }

    core.info(`Completed processing ${yamlFiles.length} YAML files`);

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();