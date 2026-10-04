# Infrastructure

Hosting for `hasanenv.co.uk`: a private S3 bucket behind CloudFront, deployed
by GitHub Actions over OIDC. No long-lived AWS credentials exist anywhere in
this setup.

## Architecture

```
Visitor
  └─> Cloudflare DNS (CNAME, DNS-only)
        └─> CloudFront distribution
              ├─ CloudFront Function (viewer-request)
              │    ├─ www -> apex 301
              │    └─ /projects/foo/ -> /projects/foo/index.html
              ├─ Response headers policy (HSTS, CSP, frame-deny)
              └─> S3 origin (private, Origin Access Control)

GitHub Actions
  └─> sts:AssumeRoleWithWebIdentity (OIDC, no stored keys)
        └─> s3 sync + CloudFront invalidation
```

### Why these choices

- **OAC instead of an S3 website endpoint.** A website-enabled bucket must be
  publicly readable and only speaks HTTP. With OAC the bucket stays private and
  CloudFront is the only thing that can read it, scoped by `AWS:SourceArn` to
  this distribution specifically.
- **A CloudFront Function, not Lambda@Edge.** The rewrite is a few lines of
  string handling. Functions run at the edge location with sub-millisecond
  latency and cost roughly a tenth of Lambda@Edge.
- **`PriceClass_100`.** Edge locations in North America and Europe only. The
  audience for this site is UK employers; paying for Asia-Pacific and South
  American edges would be spending money to solve a problem nobody has.
- **S3 native state locking.** `use_lockfile = true` replaces the DynamoDB lock
  table the older pattern required, so there is one less resource to provision, pay for
  and forget about.
- **Two `s3 sync` passes.** Hashed assets under `_astro/` get a one-year
  immutable cache; HTML gets `max-age=0, must-revalidate`. One pass with a
  single cache header would either make deploys invisible or make the site slow.

## Cost

| | |
|---|---|
| S3 storage and requests | a few pence per month at this size |
| CloudFront | free tier covers 1 TB egress and 10M requests per month |
| ACM certificate | free |
| Route 53 | not used. DNS stays on Cloudflare, saving the $0.50/month zone |

Expect well under £1/month unless the site gets genuinely popular.

## Prerequisites

- AWS CLI configured with credentials that can create S3, CloudFront, ACM and
  IAM resources
- Terraform >= 1.10
- Access to the Cloudflare DNS zone for `hasanenv.co.uk`

## Deploy

### 1. Create the state bucket (once)

```bash
terraform -chdir=infra/bootstrap init
terraform -chdir=infra/bootstrap apply -var="state_bucket_name=hasanenv-tfstate-<something-unique>"
```

### 2. Initialise the main stack

```bash
terraform -chdir=infra init -backend-config="bucket=hasanenv-tfstate-<something-unique>"
```

### 3. Request the certificate, then validate it by hand

DNS is on Cloudflare, so Terraform cannot create the validation records itself.
Create the certificate first and read the records out:

```bash
terraform -chdir=infra apply -target=aws_acm_certificate.site
terraform -chdir=infra output acm_validation_records
```

Add each record in Cloudflare as a **CNAME set to DNS only (grey cloud)**. A
proxied validation record will not resolve for ACM and validation will hang.

> Cloudflare appends the zone name to record names automatically. If the output
> gives `_abc123.hasanenv.co.uk.`, enter `_abc123` as the name, not the full
> hostname, otherwise you end up with `_abc123.hasanenv.co.uk.hasanenv.co.uk`.

### 4. Apply the rest

```bash
terraform -chdir=infra apply
```

This blocks on `aws_acm_certificate_validation` until the records propagate.
Usually a couple of minutes; it will wait up to 60.

### 5. Point the domain at CloudFront

```bash
terraform -chdir=infra output dns_records_required
```

In Cloudflare, create a CNAME for `hasanenv.co.uk` (Cloudflare's CNAME
flattening handles the apex) and one for `www`, both targeting the CloudFront
domain, both **DNS only**.

### 6. Wire up GitHub Actions

```bash
terraform -chdir=infra output
```

Set these as **repository variables** (Settings → Secrets and variables →
Actions, then Variables). None of them are secret, which is the point of OIDC.

| Variable | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `deploy_role_arn` output |
| `AWS_REGION` | `eu-west-2` |
| `AWS_S3_BUCKET` | `bucket_name` output |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `distribution_id` output |

The workflow deploys on push to `main`. The first deploy can also be triggered
manually from the Actions tab.

## Notes and limitations

- The deploy role is pinned to `repo:<owner>/<repo>:ref:refs/heads/main`. A
  different branch or a fork cannot assume it.
- `create_oidc_provider` must be set to `false` if the AWS account already
  trusts GitHub's OIDC issuer, as it is an account-wide singleton.
- Certificate validation is manual because DNS lives outside AWS. Adding the
  Cloudflare Terraform provider would automate it, at the cost of a stored
  Cloudflare API token, which rather undercuts the no-stored-credentials point
  the rest of this makes.
- There is no `terraform plan` on pull requests here. For a single-maintainer
  repository that gate buys little; for a team it would be the first thing to add.
