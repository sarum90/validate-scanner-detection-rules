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
      - uses: sarum90/validate-scanner-detection-rules@v0.1
        with:
          endpoint_url: '${{ secrets.SCANNER_API_BASE }}/v1/detection_rule_yaml/validate'
          auth_header: 'Bearer ${{ secrets.SCANNER_API_TOKEN }}'
          file_pattern: '**/*.{yml,yaml}'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `endpoint_url` | Scanner.dev API endpoint URL for validation | Yes | - |
| `auth_header` | Authorization header value (Bearer token) | No | '' |
| `file_pattern` | File pattern to match YAML detection rule files | No | `**/*.{yml,yaml}` |

## API Integration

The action sends the raw YAML content of each detection rule file to the Scanner.dev validation endpoint with `Content-Type: text/yaml` headers.

## Development

To prepare a release:

1. Install dependencies: `npm install`
2. Build the bundled distribution: `npm run build`
3. Commit the `dist/` folder: `git add dist && git commit -m "Build dist"`
4. Tag the release: `git tag v0.1 && git push --tags`

The bundled `dist/index.js` contains all dependencies, so users don't need to install anything.

