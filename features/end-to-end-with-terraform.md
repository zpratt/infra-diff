# End to End with Terraform

Goal: Demonstrate how Infra Diff can be used in an end-to-end workflow with Terraform and moto to provide a fake of the AWS API. The goal is to produce a real binary terraform plan, convert it to json, and then run infra-diff against that json plan.

## Context

In this workflow, we will use Terraform to create a simple infrastructure setup on AWS. We will use moto to mock the AWS API, allowing us to generate a binary terraform plan without needing access to a real AWS account. This plan will then be converted to JSON format and analyzed using Infra Diff to identify any potential changes or issues. The test itself should be implemented in typescript, using the infra-diff library to run the analysis programmatically, treating the production code as if it is a complete black box. We should run moto in a docker container to ensure a clean and isolated environment for the test. Everything that is created should be runnable locally with a single command and should also be included in our CI pipeline to ensure consistent results across different environments. I've added example terraform fixtures in the e2e/terraform directory to get started. Ensure you examine the e2e/terraform/provider.tf file to see how to configure terraform to point at the moto server.

## Requirements

- Ensure the pipeline uses setup-terraform action to install terraform
- Ensure we're testing with the latest version of terraform
- Use moto server in a docker container to mock AWS API
- When running locally, create a devcontainer environment that we can use to run the tests with a specific version of node and terraform.
- Write the test in typescript using infra-diff library to analyze the terraform plan json output.
- Ensure the entire setup can be run with a single command both locally and in CI.
