# AWS Firehose Send Message

A GitHub Action to send records to AWS Kinesis Data Firehose delivery streams. Simplified for test workflows.

## Features

- **Send records** - Send data records to Firehose delivery streams
- **Simple integration** - Easy to use in test workflows

## Prerequisites

Configure AWS credentials before using this action.

### Option 1: AWS Credentials (Production)

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
    aws-region: us-east-1
```

### Option 2: LocalStack (Testing)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: firehose
    steps:
      - name: Send record to LocalStack
        uses: predictr-io/aws-firehose-send-message@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          stream-name: 'test-stream'
          data: 'Test record data'
```

## Usage

### Send Simple Record

```yaml
- name: Send record to Firehose
  uses: predictr-io/aws-firehose-send-message@v0
  with:
    stream-name: 'my-delivery-stream'
    data: 'Hello from GitHub Actions!'
```

### Send JSON Data

```yaml
- name: Send JSON record
  uses: predictr-io/aws-firehose-send-message@v0
  with:
    stream-name: 'my-delivery-stream'
    data: |
      {
        "event": "deployment",
        "repository": "${{ github.repository }}",
        "sha": "${{ github.sha }}"
      }
```

### Complete Pipeline Example

```yaml
name: Deploy and Log

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Deploy application
        run: |
          echo "Deploying..."

      - name: Send deployment log
        id: log
        uses: predictr-io/aws-firehose-send-message@v0
        with:
          stream-name: 'deployment-logs'
          data: |
            {
              "timestamp": "${{ github.event.head_commit.timestamp }}",
              "repository": "${{ github.repository }}",
              "sha": "${{ github.sha }}",
              "actor": "${{ github.actor }}"
            }

      - name: Log record ID
        run: echo "Record ID: ${{ steps.log.outputs.record-id }}"
```

## Inputs

### Required Inputs

| Input | Description |
|-------|-------------|
| `stream-name` | Firehose delivery stream name |
| `data` | Data to send (string, max 1000 KB) |

## Outputs

| Output | Description |
|--------|-------------|
| `record-id` | Unique identifier assigned to the record by Firehose |

## Development

### Setup

```bash
git clone https://github.com/predictr-io/aws-firehose-send-message.git
cd aws-firehose-send-message
npm install
```

### Scripts

```bash
npm run build      # Build the action
npm run type-check # TypeScript checking
npm run lint       # ESLint
npm run check      # Run all checks
```

## License

MIT
