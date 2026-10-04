output "bucket_name" {
  description = "Origin bucket. Set as the AWS_S3_BUCKET repository variable in GitHub."
  value       = aws_s3_bucket.site.id
}

output "distribution_id" {
  description = "CloudFront distribution ID. Set as the AWS_CLOUDFRONT_DISTRIBUTION_ID repository variable."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "CloudFront domain. This is the CNAME target for your Cloudflare DNS records."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "deploy_role_arn" {
  description = "Role GitHub Actions assumes. Set as the AWS_DEPLOY_ROLE_ARN repository variable."
  value       = aws_iam_role.deploy.arn
}

output "acm_validation_records" {
  description = <<-EOT
    DNS records to create in Cloudflare so ACM can validate the certificate.
    Set each one to "DNS only" (grey cloud). A proxied record breaks validation.
  EOT
  value = [
    for option in aws_acm_certificate.site.domain_validation_options : {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  ]
}

output "dns_records_required" {
  description = "The CNAME records to create in Cloudflare once the distribution exists."
  value = {
    for alias in local.aliases : alias => {
      type   = "CNAME"
      target = aws_cloudfront_distribution.site.domain_name
      note   = "Set to DNS only (grey cloud). Proxying through Cloudflare as well stacks two CDNs and makes CloudFront's cache and security headers no longer authoritative."
    }
  }
}
