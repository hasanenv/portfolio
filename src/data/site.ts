/**
 * Single source of truth for personal details.
 * Anything marked TODO is a placeholder waiting on real content.
 */

export const site = {
  name: 'Hasan Kamran',
  // Shown under the name in the hero
  role: 'DevOps Engineer',
  positioning: 'Cloud platforms, built to be rebuilt.',
  location: 'Glasgow, Scotland',

  email: 'hasan-kamran@outlook.com',
  github: 'https://github.com/hasanenv',
  linkedin: 'https://www.linkedin.com/in/hasankamranenv',

  // Empty hides the CV buttons in the nav, the contact section and the footer.
  // Deliberately off: the site and LinkedIn already cover the same ground, and
  // a hosted CV is a public file with personal contact details in it. Setting a
  // path here is not enough on its own, the PDF has to be in /public too, or
  // the links point at nothing.
  cv: '',
  headshot: '/assets/headshot.jpg',

  url: 'https://hasanenv.co.uk',
  description:
    'DevOps engineer in Glasgow. AWS, Terraform, Kubernetes and secure CI/CD, with the architecture decisions written down.',
};

export const about: string[] = [
  'I’m a DevOps engineer based in Glasgow. Day to day that means Kubernetes and container platforms, monitoring, CI/CD and the automation that keeps internal systems running. In my own time it means the AWS platforms documented on this site.',
  'I came into infrastructure by a less conventional route, and what stuck from it is a habit of building things end to end. Every project here ships with the reasoning and the trade-offs written down next to the code, because the design choices are usually the part worth defending.',
  'Platform, cloud and Kubernetes work is where I’m strongest, and I’m open to any role where the delivery path is owned end to end and the design decisions come with it.',
];

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    title: 'Cloud',
    items: ['AWS', 'EC2 & Auto Scaling', 'S3', 'RDS', 'SNS', 'SSM Parameter Store'],
  },
  {
    title: 'Networking & Edge',
    items: ['VPC design', 'Public / private subnets', 'ALB / NLB', 'Route 53', 'ACM'],
  },
  {
    title: 'Infrastructure as Code',
    items: ['Terraform', 'Module design', 'Remote state', 'Plan-on-PR workflows', 'cloud-init', 'Helm'],
  },
  {
    title: 'Containers & Orchestration',
    items: ['Kubernetes', 'Amazon EKS', 'Rancher / RKE2', 'ECS Fargate', 'Docker', 'Traefik', 'ECR'],
  },
  {
    title: 'CI/CD & Delivery',
    items: ['GitHub Actions', 'GitOps', 'ArgoCD', 'OIDC federation', 'Immutable image tagging', 'Manual gates'],
  },
  {
    title: 'Security',
    items: ['Least-privilege IAM', 'Credential-free CI', 'Trivy', 'Grype', 'cert-manager', 'TLS automation', 'IAM auditing'],
  },
  {
    title: 'Observability',
    items: ['Prometheus', 'Grafana', 'CloudWatch', 'Gatus'],
  },
  {
    title: 'Systems & Scripting',
    items: ['Linux', 'Bash', 'Git', 'Networking & DNS'],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Solutions Architect, Associate',
    issuer: 'Amazon Web Services',
    year: '2024',
    url: 'https://www.credly.com/badges/8457c85e-5955-4f23-8dfe-7c523fe9fef2/public_url',
  },
  {
    name: 'Microsoft Certified: Azure Administrator Associate (AZ-104)',
    issuer: 'Microsoft',
    year: '2025',
    url: 'https://learn.microsoft.com/en-us/users/hasankamran-0920/credentials/4eb6cb2c36a0f14c',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    year: '2024',
    url: 'https://www.credly.com/badges/c6ea18f2-10f7-468c-9365-59e9779ee1c3/public_url',
  },
  {
    name: 'Microsoft Certified: Security, Compliance and Identity Fundamentals (SC-900)',
    issuer: 'Microsoft',
    year: '2024',
    url: 'https://learn.microsoft.com/en-us/users/hasankamran-0920/credentials/aa2dc9b7af58679',
  },
];

export const nav = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Certifications', href: '/#certifications' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Contact', href: '/#contact' },
];
