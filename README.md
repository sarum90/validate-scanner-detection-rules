# Detection Rule Validator Action

A GitHub Action that validates detection rules by scanning YAML files in a repository and submitting them to Scanner.dev's validation API.

## Usage

```yaml
name: Validate Detection Rules
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sarum90/validate-scanner-detection-rules@v0.2
        with:
          scanner_api_base: '${{ secrets.SCANNER_API_BASE }}'
          scanner_api_key: '${{ secrets.SCANNER_API_KEY }}'
          file_pattern: '**/*.yml'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `scanner_api_base` | Scanner.dev API base URL | Yes | - |
| `scanner_api_key` | Scanner.dev API key | Yes | - |
| `file_pattern` | File pattern to match YAML detection rule files | No | `**/*.yml` |

See the [Scanner.dev API documentation](https://docs.scanner.dev/scanner/using-scanner/api) for details on obtaining your API base URL and key.

## API Integration

The action sends the raw YAML content of each detection rule file to the Scanner.dev validation endpoint with `Content-Type: text/yaml` headers.

## Development

To prepare a release:

1. Install dependencies: `npm install`
2. Build the bundled distribution: `npm run build`
3. Commit the `dist/` folder: `git add dist && git commit -m "Build dist"`
4. Tag the release: `git tag v0.2 && git push --tags`

The bundled `dist/index.js` contains all dependencies, so users don't need to install anything.

