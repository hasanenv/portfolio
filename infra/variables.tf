variable "region" {
  description = "Region for the S3 origin bucket. The ACM certificate is always issued in us-east-1."
  type        = string
  default     = "eu-west-2"
}

variable "domain_name" {
  description = "Apex domain the site is served from."
  type        = string
  default     = "hasanenv.co.uk"
}

variable "www_alias" {
  description = "Also serve www.<domain_name> and 301 it to the apex."
  type        = bool
  default     = true
}

variable "bucket_name" {
  description = "Origin bucket name. Must be globally unique; defaults to the domain."
  type        = string
  default     = null
}

variable "github_repository" {
  description = "owner/repo allowed to assume the deploy role via OIDC."
  type        = string
  default     = "hasanenv/portfolio"

  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.github_repository))
    error_message = "github_repository must be in the form owner/repo."
  }
}

variable "github_environment" {
  description = <<-EOT
    GitHub Actions environment the deploy job runs in. A job with an
    `environment:` receives an environment-scoped OIDC subject, which is what
    the role trusts. Restrict this environment to the main branch in the
    repository settings.
  EOT
  type        = string
  default     = "production"
}

variable "create_oidc_provider" {
  description = <<-EOT
    Create the GitHub OIDC provider in this account. Set to false if the account
    already has one, as it is an account-wide singleton and a second one will fail.
  EOT
  type        = bool
  default     = true
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 covers NA and Europe at the lowest cost."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "tags" {
  description = "Tags applied to every taggable resource."
  type        = map(string)
  default = {
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}
