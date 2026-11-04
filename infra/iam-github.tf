// ---------------------------------------------------------------------------
// GitHub Actions deploy identity
//
// The pipeline federates into AWS with a short-lived OIDC token. There is no
// access key stored in the repository or in GitHub secrets, so there is
// nothing durable to leak and nothing to rotate.
// ---------------------------------------------------------------------------

# Account-wide singleton. If the account already trusts GitHub's OIDC issuer,
# set create_oidc_provider = false and this falls through to the data source.
resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # AWS verifies GitHub's certificate against its own trust store for this
  # issuer, but the API still requires a thumbprint to be present.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

locals {
  oidc_provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn
}

data "aws_iam_policy_document" "deploy_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Pinned to one repository AND one deployment environment.
    #
    # A job that references an `environment:` gets an environment-scoped
    # subject from GitHub, NOT a branch-scoped one, so the ref form never
    # matches here. Branch restriction is enforced on the GitHub side instead,
    # by the production environment's deployment branch rule.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:environment:${var.github_environment}"]
    }
  }
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "ListSiteBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }

  statement {
    sid    = "WriteSiteObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  # Scoped to this distribution only, so the role cannot invalidate, read or
  # modify anything else in the account's CloudFront estate.
  statement {
    sid    = "InvalidateThisDistribution"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}

resource "aws_iam_role" "deploy" {
  name                 = "${replace(var.domain_name, ".", "-")}-github-deploy"
  description          = "Assumed by GitHub Actions to publish the portfolio site"
  assume_role_policy   = data.aws_iam_policy_document.deploy_assume.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy" "deploy" {
  name   = "site-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
