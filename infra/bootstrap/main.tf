// ---------------------------------------------------------------------------
// State backend bootstrap
//
// Chicken-and-egg: remote state needs a bucket, and the bucket needs to be
// created by something. This stack runs ONCE with local state to create it.
// Everything else uses the S3 backend.
//
//   terraform -chdir=infra/bootstrap init
//   terraform -chdir=infra/bootstrap apply
//
// Commit the resulting terraform.tfstate here or keep it locally. It holds
// nothing sensitive, just the bucket definition.
// ---------------------------------------------------------------------------

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "portfolio"
      Component = "tfstate"
      ManagedBy = "terraform"
    }
  }
}

variable "region" {
  type    = string
  default = "eu-west-2"
}

variable "state_bucket_name" {
  description = "Globally unique name for the state bucket."
  type        = string
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name

  # State is the one thing you genuinely cannot afford to lose to a stray
  # terraform destroy or a mistyped bucket name.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

// Terraform already talks to S3 over HTTPS, so this denies something that
// does not currently happen. It is here so the bucket's own policy states the
// requirement rather than relying on every future client to get it right.
data "aws_iam_policy_document" "state" {
  statement {
    sid       = "DenyInsecureTransport"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.state.arn, "${aws_s3_bucket.state.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "state" {
  bucket     = aws_s3_bucket.state.id
  policy     = data.aws_iam_policy_document.state.json
  depends_on = [aws_s3_bucket_public_access_block.state]
}

output "state_bucket" {
  description = "Pass this to the main stack: terraform init -backend-config=\"bucket=<this>\""
  value       = aws_s3_bucket.state.id
}
