# infra-diff Usage Guide

## Overview

`infra-diff` is a GitHub Action that shows a preview of infrastructure changes based on terraform/terragrunt/opentofu plan files. It helps teams review infrastructure modifications directly in their GitHub workflow.

## Prerequisites

- A GitHub repository with infrastructure code (Terraform, Terragrunt, or OpenTofu)
- A generated plan file (JSON or binary format)
- GitHub Actions enabled in your repository

## Quick Start

Add the following step to your GitHub Actions workflow:

```yaml
- uses: zpratt/infra-diff@v1
  with:
    plan-file-path: ./terraform-plan.json
```

## Inputs

### `plan-file-path`

**Required**: Yes
**Type**: `string`
**Description**: Path to the terraform/terragrunt/opentofu plan file (JSON or binary format)

The path should be relative to the GitHub workspace or an absolute path within the runner environment.

**Examples**:
- `./terraform-plan.json`
- `./infrastructure/plan.tfplan`
- `${{ github.workspace }}/plans/prod-plan.json`

## Outputs

### `changes-summary`

**Type**: `string`
**Description**: Summary of infrastructure changes detected in the plan file

This output contains a textual summary of the changes that will be applied to your infrastructure. You can use this output in subsequent workflow steps, such as posting comments to pull requests or sending notifications.

**Example usage**:
```yaml
- uses: zpratt/infra-diff@v1
  id: infra-diff
  with:
    plan-file-path: ./terraform-plan.json

- name: Display summary
  run: echo "${{ steps.infra-diff.outputs.changes-summary }}"
```

## Complete Examples

### Basic Terraform Workflow

```yaml
name: Terraform Plan Review

on:
  pull_request:
    branches: [main]

jobs:
  terraform-plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.0

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan -out=tfplan.binary

      - name: Convert plan to JSON
        run: terraform show -json tfplan.binary > plan.json

      - name: Run infra-diff
        uses: zpratt/infra-diff@v1
        with:
          plan-file-path: ./plan.json
```

### Terragrunt Workflow

```yaml
name: Terragrunt Plan Review

on:
  pull_request:
    paths:
      - 'infrastructure/**'

jobs:
  terragrunt-plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.0
          terraform_wrapper: false

      - name: Setup Terragrunt
        run: |
          wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.59.0/terragrunt_linux_amd64
          chmod +x terragrunt_linux_amd64
          sudo mv terragrunt_linux_amd64 /usr/local/bin/terragrunt

      - name: Terragrunt Plan
        working-directory: ./infrastructure/prod
        run: terragrunt plan -out=plan.tfplan

      - name: Convert to JSON
        working-directory: ./infrastructure/prod
        run: terragrunt show -json plan.tfplan > plan.json

      - name: Run infra-diff
        uses: zpratt/infra-diff@v1
        with:
          plan-file-path: ./infrastructure/prod/plan.json
```

### OpenTofu Workflow

```yaml
name: OpenTofu Plan Review

on:
  pull_request:
    branches: [main]

jobs:
  opentofu-plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Setup OpenTofu
        uses: opentofu/setup-opentofu@v1
        with:
          tofu_version: 1.8.0

      - name: OpenTofu Init
        run: tofu init

      - name: OpenTofu Plan
        run: tofu plan -out=plan.tfplan

      - name: Convert plan to JSON
        run: tofu show -json plan.tfplan > plan.json

      - name: Run infra-diff
        uses: zpratt/infra-diff@v1
        with:
          plan-file-path: ./plan.json
```

### Using Outputs in Workflow

```yaml
name: Infrastructure Review with Notifications

on:
  pull_request:
    branches: [main]

jobs:
  review-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan -out=tfplan.binary

      - name: Convert plan to JSON
        run: terraform show -json tfplan.binary > plan.json

      - name: Run infra-diff
        id: diff
        uses: zpratt/infra-diff@v1
        with:
          plan-file-path: ./plan.json

      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Infrastructure Changes\n\n${{ steps.diff.outputs.changes-summary }}'
            })
```

### Multi-Environment Workflow

```yaml
name: Multi-Environment Infrastructure Review

on:
  pull_request:
    branches: [main]

jobs:
  plan-all-environments:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, prod]
    steps:
      - uses: actions/checkout@v5

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        working-directory: ./environments/${{ matrix.environment }}
        run: terraform init

      - name: Terraform Plan
        working-directory: ./environments/${{ matrix.environment }}
        run: terraform plan -out=plan.tfplan

      - name: Convert to JSON
        working-directory: ./environments/${{ matrix.environment }}
        run: terraform show -json plan.tfplan > plan.json

      - name: Run infra-diff
        id: diff
        uses: zpratt/infra-diff@v1
        with:
          plan-file-path: ./environments/${{ matrix.environment }}/plan.json

      - name: Upload plan summary
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.environment }}-plan-summary
          path: ./environments/${{ matrix.environment }}/plan.json
```

## Troubleshooting

### File Not Found Error

**Error**: `File does not exist: <path>`

**Solution**: Ensure the plan file path is correct and the file exists at that location. Check that the plan generation step completed successfully before running infra-diff.

### File Not Readable Error

**Error**: `File is not readable: <path>`

**Solution**: Verify that the file has appropriate read permissions. This is typically not an issue in GitHub Actions, but may occur with custom runner configurations.

### Invalid Path Error

**Error**: `Path is a directory, not a file`

**Solution**: Ensure you're providing a path to a file, not a directory. The path should point directly to the plan file.

## Best Practices

1. **Always generate plan files**: Ensure your workflow generates the plan file before calling infra-diff
2. **Use JSON format**: Convert binary plan files to JSON for better compatibility
3. **Pin action versions**: Use a specific version tag (e.g., `@v1`) rather than `@main` for stability
4. **Store plan artifacts**: Consider uploading plan files as artifacts for debugging and auditing
5. **Review on PRs**: Run infra-diff on pull requests to catch changes before merging

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/zpratt/infra-diff).
