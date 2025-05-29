# Detection Rule Validator Action

A GitHub Action that validates detection rules by scanning YAML files in a repository using the scanner-cli tool.

## Usage

```yaml
name: Validate Detection Rules
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sarum90/validate-scanner-detection-rules@v0.3
        with:
          scanner_api_url: '${{ secrets.SCANNER_API_URL }}'
          scanner_api_key: '${{ secrets.SCANNER_API_KEY }}'
          file_pattern: '**/*.yml'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `scanner_api_url` | Scanner.dev API URL | Yes | - |
| `scanner_api_key` | Scanner.dev API key | Yes | - |
| `file_pattern` | File pattern to match YAML detection rule files | No | `**/*.yml` |

See the [Scanner.dev CLI documentation](https://docs.scanner.dev/scanner/using-scanner/beta-features/detection-rules-as-code/cli) for details on obtaining your API URL and key.

## How it works

The action installs the scanner-cli tool and runs `scanner-cli validate` on all matching YAML files in your repository. It creates individual GitHub annotations for each validation error, pointing to the exact file and line where issues are found.

## Development

To prepare a release:

1. Install dependencies: `npm install`
2. Build the bundled distribution: `npm run build`
3. Commit the `dist/` folder: `git add dist && git commit -m "Build dist"`
4. Tag the release: `git tag v0.3 && git push --tags`

The bundled `dist/index.js` contains all dependencies, so users don't need to install anything.

