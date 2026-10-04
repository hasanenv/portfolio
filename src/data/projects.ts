export interface Decision {
  title: string;
  /** Short, skimmable points. Keep each to a single line where possible. */
  points: string[];
}

export interface Shot {
  src: string;
  caption: string;
  wide?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  /** one-line card summary */
  blurb: string;
  year: string;
  stack: string[];
  /** short list shown on the card */
  cardStack: string[];
  repo: string;
  hero: string;
  heroAlt: string;
  facts: { label: string; value: string }[];
  problem: string;
  approach: string[];
  decisions: Decision[];
  shots: Shot[];
  limitations: string[];
}

export const projects: Project[] = [
  {
    slug: 'gitea-eks-platform',
    title: 'Self-Hosted Git Platform on EKS',
    tagline: 'GitOps-managed Gitea on Amazon EKS with automated TLS, DNS and image scanning',
    blurb:
      'A production-grade Git platform on EKS for organisations that need source code to stay inside their own infrastructure. Terraform for infra, ArgoCD for delivery, nothing applied by hand.',
    year: '2026',
    stack: [
      'Amazon EKS',
      'Terraform',
      'ArgoCD',
      'Helm',
      'Traefik',
      'cert-manager',
      'ExternalDNS',
      'RDS PostgreSQL',
      'Valkey',
      'GitHub Actions',
      'Trivy',
      'KMS',
      'Grafana',
    ],
    cardStack: ['EKS', 'Terraform', 'ArgoCD', 'Helm', 'cert-manager'],
    repo: 'https://github.com/hasanenv/gitea-eks-platform',
    hero: '/assets/gitea-eks/eks-gitea.drawio.png',
    heroAlt:
      'Architecture diagram: NLB in public subnets routing to Traefik on EKS worker nodes in private subnets, backed by Multi-AZ RDS PostgreSQL',
    facts: [
      { label: 'Region', value: 'eu-west-2 · 2 AZs' },
      { label: 'Cluster', value: 'EKS · managed node group' },
      { label: 'Delivery', value: 'ArgoCD · Git as truth' },
      { label: 'TLS & DNS', value: 'cert-manager · ExternalDNS' },
    ],
    problem:
      'Cloud-hosted Git is the default, but it is the wrong default for organisations with data sovereignty requirements, regulatory constraints, or enough seats that per-user pricing stops making sense. The obvious alternative, Gitea on a single VM, trades one problem for a worse one: no self-healing, no rolling deployments, and a manual TLS renewal waiting to page someone at 2am. This project builds the version that survives contact with production.',
    approach: [
      'Terraform provisions the VPC, EKS cluster, RDS and supporting IAM, structured as one module per concern so each piece can be maintained and redeployed independently.',
      'ArgoCD owns everything inside the cluster. Git is the single source of truth, so every change to a running workload is version controlled, reviewable and auditable.',
      'cert-manager issues and renews Let’s Encrypt certificates via DNS01 challenge, and ExternalDNS writes Cloudflare records automatically when an Ingress appears. No certificate or DNS record is ever touched by hand.',
      'Two GitHub Actions workflows: Terraform plan on PR and apply on merge, plus a release pipeline that Trivy-scans the Gitea image, pushes to ECR and updates the deployed tag.',
      'Gitea state is split by durability requirement: Multi-AZ RDS PostgreSQL for application data, EBS gp3 for Git repository files, Valkey for sessions and caching.',
    ],
    decisions: [
      {
        title: 'Pull-based delivery, not push',
        points: [
          'ArgoCD runs in-cluster and syncs from Git. CI never holds cluster credentials.',
          'Auto-sync is enabled, so drift is corrected continuously rather than discovered at the next deploy.',
          'Rollback is a Git revert rather than a pipeline re-run.',
          'Declared state lives in a repository, not in operator command history.',
        ],
      },
      {
        title: 'Layer 4 edge, routing stays in Kubernetes',
        points: [
          'NLB forwards raw TCP. Traefik terminates TLS and handles host routing.',
          'Routing rules are Ingress resources in Git, reviewed in pull requests.',
          'Trade: no ALB Layer 7 features or WAF, and Traefik becomes a component to keep running.',
        ],
      },
      {
        title: 'State split by durability requirement',
        points: [
          'Multi-AZ RDS PostgreSQL for relational data.',
          'EBS gp3 for Git repository files.',
          'Valkey for sessions and cache, which are reconstructible.',
          'Keeps the compute layer replaceable rather than precious.',
        ],
      },
      {
        title: 'DNS-01 certificate validation',
        points: [
          'Proves domain control with a TXT record, not an inbound HTTP request on port 80.',
          'Issuance does not depend on the cluster being publicly reachable.',
          'Trade: cert-manager needs a DNS provider credential in the cluster.',
        ],
      },
      {
        title: 'A single ingress path',
        points: [
          'Worker nodes and RDS sit in private subnets with no public addresses.',
          'All traffic enters through the NLB.',
          'Nothing else is internet-reachable by construction, not by rule.',
        ],
      },
    ],
    shots: [
      {
        src: '/assets/gitea-eks/argocd-ui.png',
        caption: 'ArgoCD reconciling platform components against Git',
        wide: true,
      },
      {
        src: '/assets/gitea-eks/grafana-dashboard.png',
        caption: 'Cluster and workload metrics in Grafana',
        wide: true,
      },
      {
        src: '/assets/gitea-eks/pipeline-pr.png',
        caption: 'Terraform plan posted back to the pull request',
      },
    ],
    limitations: [
      'Worker nodes run SPOT instances to keep demonstration cost low. Reclamation can strand pods whose EBS volumes are pinned to a single AZ, so production would use ON_DEMAND for anything holding state.',
      'Fixed hourly costs run regardless of load: the EKS control plane, both NAT gateways, the NLB and Multi-AZ RDS.',
      'There is no destroy pipeline. Teardown is a documented manual sequence in the README, and automating it is the obvious next addition.',
      'Instance sizing is a cost decision for demonstration, not a capacity recommendation.',
      'Specific CVEs are whitelisted in <code>.trivyignore</code> with written justification, rather than lowering the scan threshold.',
      'The live environment has been torn down. The screenshots are from the running deployment.',
    ],
  },

  {
    slug: 'ecs-fargate-platform',
    title: 'Container Platform on ECS Fargate',
    tagline: 'Secure container delivery with OIDC-authenticated CI/CD and least-privilege IAM throughout',
    blurb:
      'Gatus running on ECS Fargate behind an ALB, delivered by pipelines that hold no long-lived AWS credentials. The interesting part is the delivery path and the IAM boundaries, not the container.',
    year: '2026',
    stack: [
      'ECS Fargate',
      'Terraform',
      'GitHub Actions',
      'OIDC',
      'ALB',
      'ACM',
      'Route 53',
      'ECR',
      'SSM Parameter Store',
      'CloudWatch',
      'Container Insights',
      'DynamoDB',
      'Docker',
      'Grype',
    ],
    cardStack: ['ECS Fargate', 'Terraform', 'OIDC', 'ALB', 'ECR'],
    repo: 'https://github.com/hasanenv/ecs-fargate-platform',
    hero: '/assets/ecs-fargate/ecs-diagram.png',
    heroAlt:
      'Architecture diagram: multi-AZ Application Load Balancer in public subnets fronting ECS Fargate tasks in private subnets, with ECR, SSM and CloudWatch',
    facts: [
      { label: 'Compute', value: 'ECS Fargate · 2 AZs' },
      { label: 'Auth', value: 'GitHub OIDC · no static keys' },
      { label: 'Pipelines', value: '3 · separated by blast radius' },
      { label: 'Verified', value: 'Apply and destroy, live account' },
    ],
    problem:
      'Most container platform demos stop at "it runs". The parts that decide whether a platform is safe to hand to a team are the ones usually skipped: how the pipeline authenticates to the cloud, how narrow the IAM boundaries are, whether a deployment is reproducible, and whether the destroy path is as controlled as the apply path. This project treats those as the actual deliverable.',
    approach: [
      'Terraform is split into two roots. A bootstrap root owns the CI/CD IAM roles and the ECR repository under its own state key; the application stack holds everything else and reads the repository through a data source.',
      'Three GitHub Actions workflows with clean separation of responsibility: image build and push, manual Terraform apply, and a manual destroy with its own dedicated IAM role.',
      'Every pipeline authenticates to AWS through OIDC federation. There are no long-lived access keys in the repository or in GitHub secrets.',
      'Images are built multi-stage, scanned with Grype at a high-severity cut-off, tagged by commit SHA and pushed to ECR. The current tag is written to SSM Parameter Store so infrastructure applies pick up the right immutable image without a manual edit.',
      'The scan step prints high and critical findings as a table before it gates the build, so a failed run says what failed rather than only that it did.',
      'The ALB spans two Availability Zones with HTTPS enforced via ACM and HTTP redirected. Fargate tasks run in private subnets with centralised CloudWatch logging and Container Insights.',
    ],
    decisions: [
      {
        title: 'Fargate over EKS or EC2-backed ECS',
        points: [
          'One stateless workload did not justify a control plane or a node group.',
          'No hosts to patch, drain or size, which removes a class of configuration drift.',
          'Trade: no daemonsets, host networking or GPU access.',
        ],
      },
      {
        title: 'OIDC federation, no stored keys',
        points: [
          'Short-lived token scoped to one repository and one branch.',
          'Nothing durable to leak and nothing to rotate.',
          'A fork cannot assume the role.',
        ],
      },
      {
        title: 'Application and infrastructure on separate pipelines',
        points: [
          'Image build runs on application changes. Terraform apply is manually triggered.',
          'The current image tag is held in SSM Parameter Store.',
          'An infrastructure-only apply redeploys the running image, not whatever is newest.',
        ],
      },
      {
        title: 'CI/CD identity lives outside the state it manages',
        points: [
          'CI/CD roles and the ECR repository sit in a separate bootstrap root with its own state key, so a pipeline cannot destroy the identity it is running as.',
          'This came out of a real failure: the destroy pipeline deleted its own IAM role mid-run, stranding a live load balancer, ECS service and VPC with the state unsaved and the lock held.',
          'An explicit IAM Deny on <code>DeleteRole</code> and <code>DetachRolePolicy</code> backs the split up rather than relying on layout alone.',
          'Side effect worth having: ECR images now survive a destroy.',
        ],
      },
      {
        title: 'A separate identity for destroy',
        points: [
          'Destroy is manually triggered and produces a plan before executing.',
          'It assumes a teardown-scoped role, distinct from the apply role.',
        ],
      },
      {
        title: 'Nothing account-specific in the code',
        points: [
          'Domain, state bucket, lock table and region are variables. The backend is configured at init time.',
          'IAM policy ARNs are built from variables, so no account ID is committed.',
          'The repository can be forked and deployed by setting GitHub variables rather than editing Terraform.',
        ],
      },
      {
        title: 'SHA-tagged images only',
        points: [
          'Nothing is tagged <code>latest</code>.',
          'Every running task traces back to an exact commit.',
        ],
      },
    ],
    shots: [],
    limitations: [
      'The bootstrap root is applied manually with admin credentials. Only the application stack is pipeline-driven.',
      'State locking uses a DynamoDB table rather than S3 native locking.',
      'A single zonal NAT Gateway trades egress availability for cost. Production would run one per AZ.',
      'One environment, with no alerting and no log retention policy configured.',
      'Two CVEs are ignored in <code>.grype.yaml</code> with written justification rather than lowering the scan threshold. Neither is reachable from this application.',
      'The live environment has been torn down after verification.',
    ],
  },

  {
    slug: 'iam-auditor',
    title: 'AWS IAM Permissions Auditor',
    tagline: 'Detecting over-privileged identities across an AWS account, with an audit trail and alerting',
    blurb:
      'IAM permissions grow organically until nobody can answer "who has admin?". This audits users, roles and groups for AdministratorAccess, writes a timestamped report to S3 and alerts via SNS.',
    year: '2025',
    stack: ['Bash', 'AWS IAM', 'STS', 'S3', 'SNS', 'EC2', 'Instance Roles'],
    cardStack: ['Bash', 'IAM', 'S3', 'SNS', 'EC2'],
    repo: 'https://github.com/hasanenv/iam-auditor-tool',
    hero: '/diagrams/iam-auditor.svg',
    heroAlt:
      'Architecture diagram: the auditor queries AWS IAM from EC2 under an instance role, writes a timestamped report to S3 on every run, and publishes an SNS alert only when over-privileged identities are found',
    facts: [
      { label: 'Runtime', value: 'EC2 · instance role' },
      { label: 'Credentials', value: 'None stored' },
      { label: 'Output', value: 'Timestamped report to S3' },
      { label: 'Alerting', value: 'SNS email on violation' },
    ],
    problem:
      'Provisioning infrastructure well is only half of platform work. The other half is noticing when it drifts. IAM is where that drift is least visible: permissions accumulate through one-off grants and temporary escalations that are never revoked, and there is no moment at which anyone is forced to look. This makes over-privileged identities visible and alertable without a manual investigation.',
    approach: [
      'Queries IAM for every user, role and group with AdministratorAccess attached, using STS to verify which account it is actually running against.',
      'Generates a timestamped report of findings and uploads it to S3, so there is a historical record rather than just a point-in-time answer.',
      'Publishes an SNS email alert only when violations are found, so a clean run stays quiet and an alert means something.',
      'Runs on EC2 under an instance role with a scoped policy committed alongside the script. No credentials are stored anywhere.',
    ],
    decisions: [
      {
        title: 'A detective control, not a preventive one',
        points: [
          'Catches grants that were legitimate when made and never revoked.',
          'Answers what is true now, rather than what was permitted at the time.',
        ],
      },
      {
        title: 'Runs are kept, not just printed',
        points: [
          'Each run is written to S3 as a timestamped report.',
          'Builds a history instead of a point-in-time answer.',
        ],
      },
      {
        title: 'The auditor holds no credentials',
        points: [
          'Runs under an EC2 instance role, with nothing stored on the host.',
          'The scoped policy is committed alongside the script, so both are reviewed together.',
        ],
      },
      {
        title: 'Alerts only on findings',
        points: [
          'SNS fires when over-privileged identities are found. A clean run stays silent.',
          'Trade: a failed run looks like a clean one, so the S3 report is the signal that it ran.',
        ],
      },
    ],
    shots: [
      {
        src: '/assets/iam-auditor/terminal.png',
        caption: 'A run against an account with two over-privileged identities',
        wide: true,
      },
      {
        src: '/assets/iam-auditor/s3-bucket.png',
        caption: 'Timestamped audit reports accumulating in S3',
      },
      {
        src: '/assets/iam-auditor/sns-email.png',
        caption: 'SNS email alert raised when over-privileged identities are found',
      },
    ],
    limitations: [
      'Detects AdministratorAccess specifically rather than scoring arbitrary policy breadth.',
      'Scheduling is external to the tool. Planned improvements are tracked in docs/considerations.md.',
    ],
  },
];

export interface SideProject {
  name: string;
  description: string;
  stack: string[];
  repo: string;
}

export const sideProjects: SideProject[] = [
  {
    name: 'ci-cd-pipelines',
    description: 'Container build-and-publish workflows and Terraform validation pipelines in GitHub Actions.',
    stack: ['GitHub Actions', 'Terraform', 'Docker'],
    repo: 'https://github.com/hasanenv/ci-cd-pipelines',
  },
  {
    name: 'linux-bandit-challenge-guide',
    description: 'A written guide teaching essential Linux command-line skills from scratch via OverTheWire: Bandit.',
    stack: ['Linux', 'Bash', 'Teaching'],
    repo: 'https://github.com/hasanenv/linux-bandit-challenge-guide',
  },
];
