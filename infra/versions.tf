terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Remote state. Create the bucket first with infra/bootstrap, then run
  # `terraform init` here. S3 native locking (use_lockfile) replaces the old
  # DynamoDB lock table, so there is no second resource to pay for or maintain.
  backend "s3" {
    key          = "portfolio/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
    # bucket is supplied at init time:
    #   terraform init -backend-config="bucket=<your-state-bucket>"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = var.tags
  }
}

# CloudFront only accepts certificates issued in us-east-1, regardless of
# where the rest of the stack lives.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.tags
  }
}
