provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    sts = "http://localhost:50000"
    s3  = "http://localhost:50000"
    sqs = "http://localhost:50000"
  }
}
