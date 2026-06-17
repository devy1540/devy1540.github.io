import type { Language } from "@/i18n"
import {
  PROFILE,
  SKILLS,
  COMPANIES,
  CERTIFICATIONS,
  PROJECTS,
  type Certification,
  type Company,
  type ProjectDetail,
} from "@/data/resume"

interface ResumeData {
  profile: typeof PROFILE
  skills: typeof SKILLS
  companies: Company[]
  certifications: Certification[]
  projects: ProjectDetail[]
}

const EN_PROFILE: typeof PROFILE = {
  ...PROFILE,
  name: "Hyukjun Yoon",
  introduction:
    "I am a backend engineer who turns business requirements into product features such as payments, reservations, lessons, and notifications, then designs service structures that scale reliably.\nI have migrated legacy payment and authentication systems to Java/Spring and reshaped high-risk operational domains into observable, change-friendly systems.\nRecently, I have been applying LLM pipelines and AI code review automation in production to improve both product quality and development productivity.",
}

const EN_COMPANIES: Company[] = [
  {
    name: "Day1 Company",
    role: "Backend Engineer",
    period: "Aug 2024 - Present",
    highlights: [
      "Redesigned **core user flows** across payments, authentication, lessons, and onboarding",
      "Migrated legacy PHP payment and authentication features to Java/Spring and **removed PHP operational dependency**",
      "Moved JWT signing to an RS256/JWKS/KMS model to **separate signing authority from verification authority**",
      "Reduced **CS tickets by 98%** with an AI diagnostic pipeline and achieved **0% duplicate sends** with a multi-channel notification server",
      "Reworked coupon, subscription, and lesson-pass domains around metadata and segmentation to support **operational automation and product extensibility**",
      "Established Facade layers and shared response/error rules to **reduce domain change scope and collaboration cost**",
      "Modernized the platform with ECS to EKS migration, ArgoCD GitOps, LGTM observability, WAF, and Secrets Manager",
    ],
    projects: [
      { slug: "ai-diagnostic-pipeline", name: "AI Diagnostic and Feedback Pipeline", period: "Oct 2025 - Jan 2026", summary: "Redesigned a 7-step AI pipeline and reduced CS tickets by 98%" },
      { slug: "payment-system", name: "Payment System Redesign", period: "Mar 2025 - Sep 2025", summary: "Migrated PHP to Java and reduced duplicate payments to zero" },
      { slug: "notification-server", name: "Multi-channel Notification Server", period: "Jun 2025 - Oct 2025", summary: "Built an independent 4-channel notification server from scratch with 0% duplicate sends" },
      { slug: "personalization-system", name: "User Data-driven Personalization System", period: "Jan 2025 - Jan 2026", summary: "Built segmented coupon and churn-prevention flows" },
      { slug: "onboarding-trial-flow", name: "Onboarding and Trial Lesson Flow Improvement", period: "Apr 2026 - May 2026", summary: "Improved consistency across first-lesson booking, preview, and entry states" },
      { slug: "auth-refactoring", name: "Authentication Refactoring and Legacy Migration", period: "Sep 2024 - Apr 2026", summary: "Migrated legacy authentication and separated signing and verification responsibilities" },
      { slug: "dev-process", name: "Development Process Improvements", period: "Sep 2024 - Feb 2026", summary: "Introduced Facade patterns, standardized responses/errors, and redesigned domains around metadata" },
      { slug: "infra-modernization", name: "Infrastructure Modernization and Security Foundation", period: "Oct 2025 - Jan 2026", summary: "Migrated ECS to EKS and built WAF and GitOps foundations" },
    ],
  },
  {
    name: "EXEM",
    role: "Backend Engineer",
    period: "Jul 2020 - May 2024",
    highlights: [
      "Improved Kubernetes monitoring API calls by **up to 90%** and helped launch CloudMOA",
      "Built a Kafka Streams and Apache Druid pipeline that processed **45,000 events per second** without performance degradation",
      "Launched the SaaS monitoring product **DataSaker** and built shared MSA libraries",
      "Optimized DPM queries to serve large data reads within **100ms to 3s**",
    ],
    projects: [
      { slug: "dpm-monitoring", name: "On-premise DPM Monitoring System Refactoring", period: "Jan 2024 - May 2024", summary: "Optimized queries to respond within 100ms to 3s" },
      { slug: "saas-monitoring", name: "SaaS Monitoring Service Business Logic", period: "Sep 2021 - Dec 2023", summary: "Implemented a multi-tenant monitoring service and launched DataSaker" },
      { slug: "data-pipeline", name: "SaaS Monitoring Data Collection Pipeline", period: "Jan 2021 - Sep 2021", summary: "Built a Kafka Streams and Apache Druid pipeline" },
      { slug: "k8s-monitoring", name: "Kubernetes Monitoring System Development", period: "Aug 2020 - Jan 2021", summary: "Improved API calls by 90% and launched CloudMOA" },
    ],
  },
]

const EN_CERTIFICATIONS: Certification[] = [
  { name: "AWS Certified Developer - Associate", year: "2023" },
  { name: "CKA (Certified Kubernetes Administrator)", year: "2022" },
  { name: "SQLD", year: "2022" },
  { name: "Engineer Information Processing", year: "2019" },
]

const EN_PROJECTS: ProjectDetail[] = [
  {
    slug: "ai-diagnostic-pipeline",
    company: "Day1 Company",
    name: "AI Diagnostic and Feedback Pipeline",
    period: "Oct 2025 - Jan 2026",
    tech: ["Spring AI", "Gemini", "Amazon Bedrock", "OpenAI", "Spring Boot"],
    relatedPosts: ["spring-ai-pipeline-real-world"],
    tasks: [
      {
        content: "Redesigned a diagnosis process that depended on direct HTTP calls and one synchronous prompt into a **7-step Spring AI pipeline**: STT load, semantic chunking, STT correction, metric calculation, LLM feedback, question generation, and notification",
        details: [
          "Reduced **CS tickets by 98%** through better diagnostic quality",
          "Integrated the pipeline into the existing Java/Spring environment to reduce maintenance burden and development complexity",
          "Separated pipeline stages asynchronously to reduce bottlenecks and stabilize processing time",
        ],
      },
      {
        content: "Assigned Gemini, Amazon Bedrock, and OpenAI models to stage-specific roles and designed a back-office flow for **changing models and prompts without downtime**",
        details: [
          "Reduced **LLM cost by about 50%**",
        ],
      },
      {
        content: "Added hallucination correction and retry logic for format validation failures",
        details: [
          "Reduced diagnostic report generation time from **6-7 minutes to 1-2 minutes**",
        ],
      },
    ],
  },
  {
    slug: "payment-system",
    company: "Day1 Company",
    name: "Payment System Redesign",
    period: "Mar 2025 - Sep 2025",
    tech: ["Java", "Spring Boot", "Redis", "PortOne"],
    tasks: [
      {
        content: "Migrated a legacy PHP payment system to Java/Spring while gradually moving from PortOne v1 to v2 with backward compatibility",
      },
      {
        content: "Separated payment approval, verification, and post-processing stages and redesigned the flow around APIs to simplify payment-state tracking and transaction boundaries",
      },
      {
        content: "Handled concurrent payments and delayed PG responses with Redis Lock idempotency checks plus webhook and polling double verification, achieving **0 duplicate payments**",
      },
      {
        content: "Designed defensive logic for edge cases such as automatic refunds, coupon recovery, and compensation-ticket recovery, reducing payment-related **CS issues by 90%**",
      },
      {
        content: "Unified payment flows around enum-based type handling, reducing the effort for adding new payment methods by **more than 50%**",
      },
      {
        content: "Implemented and unit-tested a subscription expiration-date calculation algorithm",
        details: [
          "Removed manual end-of-month correction work",
        ],
      },
    ],
  },
  {
    slug: "notification-server",
    company: "Day1 Company",
    name: "Multi-channel Notification Server",
    period: "Jun 2025 - Oct 2025",
    tech: ["Spring Boot", "SQS", "Redis", "DynamoDB"],
    relatedPosts: ["multi-channel-notification-server"],
    tasks: [
      {
        content: "Designed and built an independent notification server from scratch to integrate channels such as KakaoTalk, SMS, app push, and Slack, consolidating notification logic scattered across backend and PHP into Java/Spring",
      },
      {
        content: "Configured an **SQS-based event-driven architecture** with DLQs to process bulk sends without notification loss",
      },
      {
        content: "Designed enum-based channel routing and a client SDK to minimize registration points when adding new notifications",
      },
      {
        content: "Built an annotation-based SDK using **Java Reflection** to map notification template variables to object fields automatically",
      },
      {
        content: "Added back-office features and menus for managing notification messages and sending settings",
      },
      {
        content: "Achieved **0% duplicate sends** with Redis Lock idempotency checks and reduced Kakao notification cost by **10%** through deduplication",
      },
      {
        content: "Implemented AWS DynamoDB-based history management and per-user scheduled notifications",
      },
    ],
  },
  {
    slug: "personalization-system",
    company: "Day1 Company",
    name: "User Data-driven Personalization System",
    period: "Jan 2025 - Jan 2026",
    tech: ["Spring Boot", "Redis", "PostgreSQL", "AWS Lambda"],
    tasks: [
      {
        content: "Built a user-segment engine based on course history and issued segmented coupons automatically",
        details: [
          "Moved from batch cron issuance to condition-based automatic issuance, making marketing and operations actions more granular",
        ],
      },
      {
        content: "Calculated each user's available coupons and reflected the maximum discount directly in pricing and checkout",
        details: [
          "Lowered the purchase-entry barrier by showing the best discount without requiring separate coupon selection",
        ],
      },
      {
        content: "Added certificate issuance to reinforce user progress and achievement",
        details: [
          "Normalized webhook requests and used AWS Lambda to generate PDFs and email them to users",
        ],
      },
    ],
  },
  {
    slug: "onboarding-trial-flow",
    company: "Day1 Company",
    name: "Onboarding and Trial Lesson Flow Improvement",
    period: "Apr 2026 - May 2026",
    tech: ["React", "TypeScript", "Spring Boot", "Playwright", "Feature Flag"],
    tasks: [
      {
        content: "Connected trial lesson booking, preview, and entry states to the home onboarding and lesson domains to improve the first-lesson path for new users",
      },
      {
        content: "Designed the new onboarding flow and existing trial logic to run side by side behind an onboarding feature flag",
        details: [
          "Preserved existing trial logic when the flag is disabled to reduce stage and production rollout risk",
        ],
      },
      {
        content: "Cleaned up common inconsistency cases such as booked trial cards, additional trial CTAs, preview/entry routing, and level synchronization",
      },
      {
        content: "Compared lecture start time in the backend OnboardingService getState synchronization and preserved existing trial-state calculation even when onboarding is disabled",
      },
      {
        content: "Verified booking, reuse, paid-user protection, and stage-entry conditions with Playwright E2E and unit tests",
      },
    ],
    achievements: [
      "Prepared a feature-flagged structure that can operate the new onboarding flow alongside the existing trial flow",
      "Improved state consistency and reduced edge cases in the first-lesson entry path",
    ],
  },
  {
    slug: "auth-refactoring",
    company: "Day1 Company",
    name: "Authentication Refactoring and Legacy Migration",
    period: "Sep 2024 - Apr 2026",
    tech: ["Java", "Spring Boot", "Spring OAuth2", "JWT", "JWKS", "GCP KMS", "Redis"],
    relatedPosts: ["auth-authorize-callback-flow", "auth-token-verification-migration", "jwt-hs256-to-rs256-jwks-kms"],
    tasks: [
      {
        content: "Reorganized authentication responsibilities scattered across PHP sessions and frontend token issuance into a Java/Spring-based authentication server",
      },
      {
        content: "Migrated to server-side JWT authentication and applied Refresh Token Rotation",
      },
      {
        content: "Moved JWT signing from HS256 to an RS256/JWKS model and designed a GCP KMS signing flow with `kid`-based key rotation",
        details: [
          "Distributed only public keys to verification services and restricted signing authority to the authentication server and KMS permissions",
          "Kept a legacy decoder that temporarily accepted existing HS256 tokens to enable a no-downtime migration",
          "Defined a key-rotation order that considered JWKS cache TTL and access-token expiration",
        ],
      },
      {
        content: "Migrated PHP legacy features such as authentication, user management, and API routing to Java to remove dual PHP/Java operation",
      },
      {
        content: "Resolved a **security issue** where PHP session problems could expose another user's account information",
      },
      {
        content: "Established a Spring OAuth2-based authentication flow",
        details: [
          "Configured a flow that exchanges external login results for service-owned tokens",
          "Prepared an extensible structure for adding authentication providers",
          "Improved maintainability and operations efficiency by consolidating authentication into service-owned OAuth",
        ],
      },
    ],
    achievements: [
      "Consolidated authentication responsibilities from frontend and PHP into a Java/Spring authentication server",
      "Separated signing authority and verification authority so multiple services can verify tokens with public keys",
    ],
  },
  {
    slug: "dev-process",
    company: "Day1 Company",
    name: "Development Process Improvements",
    period: "Sep 2024 - Feb 2026",
    tech: ["Java", "Spring Boot"],
    relatedPosts: ["spring-facade-pattern-layered-architecture", "api-response-error-standardization"],
    tasks: [
      {
        content: "Introduced a **Facade layer** into the Spring MVC structure and established a Controller -> Facade(gateway) -> Service -> Repository development rule",
        details: [
          "Kept Service and Repository responsibilities domain-specific and handled service orchestration in Facades",
          "Reduced duplicated business logic and improved domain-logic reuse",
        ],
      },
      {
        content: "Standardized response and error handling",
        details: [
          "Replaced 200 responses containing 4xx/5xx status with HTTP status code-based responses",
          "Made API calls traceable by response code in monitoring, improving incident-response speed",
          "Reduced frontend/backend communication cost by standardizing response and error formats",
        ],
      },
      {
        content: "Redesigned hardcoded product structures into a **metadata-based lesson-pass domain** so new products such as double packs or Japanese courses can launch without code changes",
      },
      {
        content: "Improved lesson-pass admin features and consolidated shared logic, reducing operations-team lesson-pass management time by **more than 50%**",
      },
      {
        content: "Moved time handling from KST-based logic to UTC-based logic to improve timezone handling for international users",
      },
    ],
  },
  {
    slug: "infra-modernization",
    company: "Day1 Company",
    name: "Infrastructure Modernization and Security Foundation",
    period: "Oct 2025 - Jan 2026",
    tech: ["Kubernetes", "ArgoCD", "Terraform", "Grafana", "Loki", "Tempo", "Mimir", "OpenTelemetry", "AWS WAF"],
    relatedPosts: ["ecs-to-eks-migration", "lgtm-stack-observability"],
    tasks: [
      {
        content: "Migrated ECS to EKS and configured operations around kustomize and the Kubernetes Gateway API. Built an **ArgoCD-based GitOps** deployment pipeline from PR merge to build, deployment, and Slack notification",
      },
      {
        content: "Introduced **AWS WAF** after detecting web attacks such as SQL injection and codified the rules with Terraform. Removed secrets from code by moving to Secrets Manager",
      },
      {
        content: "Built an **LGTM observability stack** with Grafana, Loki, Tempo, and Mimir to reduce Datadog cost and added basic server-metric dashboards",
      },
      {
        content: "Added MDC-based request tracing logs so logs, traces, and metrics can be investigated together by trace ID",
      },
    ],
  },
  {
    slug: "dpm-monitoring",
    company: "EXEM",
    name: "On-premise DPM Monitoring System Refactoring",
    period: "Jan 2024 - May 2024",
    tech: ["Java", "Spring Boot", "MyBatis", "PostgreSQL"],
    tasks: [
      { content: "Reworked MyBatis queries with subquery structures to avoid query-size limits from large parameter sets" },
      { content: "Combined multiple split read queries into a single query to improve response performance" },
      { content: "Implemented core business logic for a database analysis tool" },
    ],
    achievements: [
      "Improved large data read performance to respond within 100ms to 3s",
      "Provided database status and analysis metrics visually in the user interface",
    ],
  },
  {
    slug: "saas-monitoring",
    company: "EXEM",
    name: "SaaS Monitoring Service Business Logic",
    period: "Sep 2021 - Dec 2023",
    tech: ["Java", "Spring Boot", "Keycloak", "OpenAPI"],
    tasks: [
      { content: "Implemented user and tenant metadata management features" },
      { content: "Implemented monitoring features and user dashboard authoring features" },
      { content: "Managed API specifications with OpenAPI to keep backend and frontend code formats consistent" },
      { content: "Implemented SLA features for checking SaaS service status" },
      { content: "Built middleware log analysis for quality management" },
      { content: "Created and published shared libraries for code reuse in an MSA environment" },
      { content: "Built a Nexus Repository for managing internal libraries" },
    ],
    achievements: [
      "Provided service-specific monitoring features to users",
      "Supported login and SSO with Keycloak",
      "Implemented admin features for creating tenants and inviting users",
      "Reduced frontend integration cost through API-spec-driven collaboration",
      "Enabled real-time distributed-server status checks through SLA features",
      "Collected Apache Druid logs and sent daily report emails",
      "Improved team productivity by reducing duplicate code with shared libraries",
    ],
  },
  {
    slug: "data-pipeline",
    company: "EXEM",
    name: "SaaS Monitoring Data Collection Pipeline",
    period: "Jan 2021 - Sep 2021",
    tech: ["Kafka Stream", "Apache Druid", "Spring Boot", "Kubernetes"],
    relatedLinks: [{ title: "Apache Druid article", url: "https://ex-em.com/ko/academy/Part.1-Druid" }],
    tasks: [
      { content: "Used Kafka Streams to transform collected Kafka data into service-specific query data" },
      { content: "Collected, stored, and served real-time data with Apache Druid" },
      { content: "Optimized Apache Druid ingestion and query paths under limited infrastructure" },
      { content: "Configured Kubernetes scale in/out based on memory usage for uninterrupted operation under changing load" },
    ],
    achievements: [
      "Implemented Kafka Streams with Spring Boot for maintainability",
      "Reduced duplicated data-processing logic across servers and improved productivity",
      "Maintained 45,000 events per second even with about half of the officially recommended infrastructure scale",
      "Reduced data loss and duplication to maintain collection consistency",
    ],
  },
  {
    slug: "k8s-monitoring",
    company: "EXEM",
    name: "Kubernetes Monitoring System Development",
    period: "Aug 2020 - Jan 2021",
    tech: ["Java", "Spring Boot", "QueryDSL", "Prometheus", "JMeter"],
    tasks: [
      { content: "Reduced N metric calls to 1-3 calls by using Prometheus Multi Query" },
      { content: "Introduced QueryDSL into JPA Native Query-based read logic" },
      { content: "Applied design patterns to reduce hardcoding and inefficient logic" },
      { content: "Implemented business logic for querying Kubernetes resources" },
      { content: "Performed load tests with JMeter" },
    ],
    achievements: [
      "Reduced API calls by up to 90%",
      "Improved readability and reduced hardcoding with the builder pattern",
      "Made query errors detectable at compile time by introducing QueryDSL",
      "Handled about 50,000 TPS without performance degradation in internal tests",
      "Launched the cloud monitoring solution CloudMOA",
    ],
  },
]

const KO_RESUME: ResumeData = {
  profile: PROFILE,
  skills: SKILLS,
  companies: COMPANIES,
  certifications: CERTIFICATIONS,
  projects: PROJECTS,
}

const EN_RESUME: ResumeData = {
  profile: EN_PROFILE,
  skills: SKILLS,
  companies: EN_COMPANIES,
  certifications: EN_CERTIFICATIONS,
  projects: EN_PROJECTS,
}

export function getResumeData(language: Language): ResumeData {
  return language === "en" ? EN_RESUME : KO_RESUME
}
