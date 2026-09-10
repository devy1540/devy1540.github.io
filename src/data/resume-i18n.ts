import type { Language } from "@/i18n"
import {
  PROFILE,
  AI_NATIVE_WORKFLOW,
  SKILLS,
  COMPANIES,
  CERTIFICATIONS,
  PROJECTS,
  type Certification,
  type AiNativeWorkflowItem,
  type Company,
  type ProjectDetail,
} from "@/data/resume"

interface ResumeData {
  profile: typeof PROFILE
  aiNativeWorkflow: AiNativeWorkflowItem[]
  skills: typeof SKILLS
  companies: Company[]
  certifications: Certification[]
  projects: ProjectDetail[]
}

const EN_PROFILE: typeof PROFILE = {
  ...PROFILE,
  name: "Hyukjun Yoon",
  introduction:
    "I design backend systems and apply AI to real services and business workflows.\nI have redesigned payment and authentication systems and brought LLM-based diagnostics and support-assistance features into production.\nTo reduce repetitive development work, I have built development and review agents and am developing E2E and audit agents.\nI connect implementation, testing, deployment, and operations, verifying changes through execution records and actual behavior.",
}

const EN_AI_NATIVE_WORKFLOW: AiNativeWorkflowItem[] = [
  {
    title: "From requirements to working features",
    description: "I connect backend design and implementation with interfaces, tests, deployment, and observability. My experience operating payment, authentication, and AI services informs the scope of each change.",
  },
  {
    title: "Workflows for agent collaboration",
    description: "I **separate development and review responsibilities** and preserve request context and evidence across handoffs. I define where agents can proceed and where people need to decide.",
  },
  {
    title: "Outcomes checked against execution evidence",
    description: "I verify results with code, tests, and runtime logs. I **distinguish PR creation, deployment, and actual resolution**, and turn failures into reproduction and regression checks.",
  },
]

const EN_COMPANIES: Company[] = [
  {
    name: "Day1 Company",
    role: "Backend Engineer",
    period: "Aug 2024 - Present",
    projects: [
      { slug: "ai-agent-workflow", name: "AI Agent Workflows for Development and Operations", period: "2026 - Present", summary: "Development and review agents built; E2E and audit agents in development" },
      { slug: "cs-automation", name: "AI-assisted Customer Support System", period: "May 2026 - Jul 2026", summary: "Built drafts, QA, error diagnosis, and human review; CS handling volume fell by about 43% after adoption" },
      { slug: "ai-diagnostic-pipeline", name: "AI Diagnostic and Feedback Pipeline", period: "Oct 2025 - Jan 2026", summary: "Redesigned a 7-step AI pipeline and reduced CS tickets by 98%" },
      { slug: "payment-system", name: "Payment System Redesign", period: "Mar 2025 - Sep 2025", summary: "Migrated PHP to Java and reduced duplicate payments to zero" },
      { slug: "global-expansion", name: "Service Localization for Japan Expansion", period: "Jun 2026 - Aug 2026", summary: "Completed authentication, app internationalization, language and timezone support, and multilingual document generation" },
      { slug: "infra-modernization", name: "Infrastructure Modernization and Security Foundation", period: "Oct 2025 - Jul 2026", summary: "ECS-to-EKS and AWS-to-GCP migrations, storage transitions, GitOps, security, and observability" },
      { slug: "notification-server", name: "Multi-channel Notification Server", period: "Jun 2025 - Oct 2025", summary: "Built an independent 4-channel notification server from scratch with 0% duplicate sends" },
      { slug: "personalization-system", name: "User Data-driven Personalization System", period: "Jan 2025 - Jan 2026", summary: "Built segmented coupon and churn-prevention flows" },
      { slug: "onboarding-trial-flow", name: "Onboarding and Trial Lesson Flow Improvement", period: "Apr 2026 - May 2026", summary: "Improved consistency across first-lesson booking, preview, and entry states" },
      { slug: "auth-refactoring", name: "Authentication Refactoring and Legacy Migration", period: "Sep 2024 - Apr 2026", summary: "Migrated legacy authentication and separated signing and verification responsibilities" },
      { slug: "dev-process", name: "Development Process Improvements", period: "Sep 2024 - Feb 2026", summary: "Introduced Facade patterns, standardized responses/errors, and redesigned domains around metadata" },
    ],
  },
  {
    name: "EXEM",
    role: "Backend Engineer",
    period: "Jul 2020 - May 2024",
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
    slug: "ai-agent-workflow",
    company: "Day1 Company",
    name: "AI Agent Workflows for Development and Operations",
    period: "2026 - Present",
    tech: ["TypeScript", "Python", "Codex App Server", "Hermes Agent", "MCP", "Slack API", "SQLite"],
    tasks: [
      {
        content: "**Built development and review agents** to reduce repeated context sharing and follow-up instructions; extending the workflow with E2E and audit agents",
      },
      {
        content: "Built a development agent on Codex App Server to **reuse the Codex harness's tool execution, session management, and approval workflows in Slack**",
        details: [
          "Connect Slack development requests to requirements analysis, code changes, testing, and PR creation, mapping conversations to work sessions to preserve context for follow-up requests",
          "Pass the original request and recent conversation into the execution input, and assign repositories and worktrees per task",
        ],
      },
      {
        content: "Built an **independent review agent with Hermes Agent**, connecting its Slack Gateway, dedicated GitHub and Slack MCP tools, and PR and security review skills",
        details: [
          "Reserved product-code modification for the development agent and designed revision, re-review, and human escalation rules based on review findings",
          "Pinned reviews to a commit and checked the current code before posting, preventing duplicate reviews and blind retries when delivery is uncertain",
          "Customized Gateway behavior to route progress logs separately from final replies and prevent mentions in intermediate messages from triggering other bots",
        ],
      },
      {
        content: "**Developing an E2E agent that automates per-PR test environment setup and verification of changed functionality**",
        details: [
          "Combine PR branches across repositories to automatically provision a web, backend, and admin test environment, then select and run Playwright tests based on the scope of changes",
        ],
      },
      {
        content: "**Developing an audit agent** to compare execution records with deliverables and identify incomplete work, omissions, and recurring errors",
      },
      {
        content: "**Stored work results separately from message delivery state**, implementing delivery recovery without repeating code work when sending fails",
        details: ["Distinguish permission, review, and deployment waits from confirmed resolution, and attach the next owner and action to results"],
      },
      {
        content: "Wrote a **self-improvement skill** that reproduces failures and checks fixes against unchanged tests and normal cases; defined daily audit procedures to track unfinished work and recurring errors",
      },
    ],
  },
  {
    slug: "global-expansion",
    company: "Day1 Company",
    name: "Service Localization for Japan Expansion",
    period: "Jun 2026 - Aug 2026",
    tech: ["Spring Boot", "Spring OAuth2", "React", "TypeScript", "GrowthBook", "GCS", "Cloud Run"],
    relatedPosts: ["i18n-01-foundation", "i18n-02-language-pack-gcs", "i18n-05-document-render"],
    tasks: [
      {
        content: "Added **LINE, Google, and Apple social login** and LINE friend-add integration to offer Japanese users more ways to access the service",
      },
      {
        content: "Built an **app internationalization (i18n) foundation** that separates localized text from app code, loading language packs from GCS at runtime so translations can change without redeploying the app",
        details: [
          "Fall back to bundled text if language-pack loading fails, and control rollout scope with a GrowthBook kill switch",
        ],
      },
      {
        content: "Implemented **user language and timezone settings APIs and screens**, propagated language codes through authentication data, and added language-based home banner targeting",
      },
      {
        content: "Reworked completion certificates and level-test reports into **HTML templates and language-specific strings**, replacing per-language background image redesigns with multilingual document generation",
        details: [
          "Separated responsibilities: the backend sends issuance events and a Cloud Run service renders HTML and localized text into PDFs",
        ],
      },
    ],
    achievements: [
      "Completed backend and app localization required for entering the Japanese market",
      "Enabled translation updates without app redeployment and document localization without recreating images for each language",
    ],
  },
  {
    slug: "cs-automation",
    company: "Day1 Company",
    name: "AI-assisted Customer Support System",
    period: "May 2026 - Jul 2026",
    tech: ["Spring AI", "Spring Boot", "Gemini", "Redis", "Pub/Sub"],
    relatedPosts: ["spring-ai-cs-automation"],
    tasks: [
      {
        content: "Consolidated draft replies and tag suggestions from PHP and n8n into Spring AI, with **human support staff reviewing and sending replies**",
      },
      {
        content: "Fetched customer context in parallel in the backend and **separated fast draft generation from FAQ and document-based QA** to reduce waiting time",
      },
      {
        content: "Used Pub/Sub events, per-ticket Redis locks, and customer-input identifiers to **prevent duplicate drafts and stale-event processing** while generating new drafts for follow-up inquiries",
      },
      {
        content: "Added error diagnosis using logs, traces, and user activity, together with citations and confidence evaluation, so support staff can review evidence and unresolved questions",
      },
    ],
    achievements: [
      "Observed an **approximately 43% reduction in CS handling volume** in operational data after system adoption",
    ],
  },
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
        content: "**Migrated the legacy PHP payment system to Java/Spring** and redesigned payment verification, lesson-pass issuance, and failure recovery",
      },
      {
        content: "Handled payment verification, storage, and lesson-pass issuance on the server after PortOne payment-completion webhooks, while the app queried an API for processing results",
      },
      {
        content: "Controlled concurrent payment processing with Redis locks and checked whether a payment had already been processed, achieving **0 duplicate payments**",
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
    period: "Oct 2025 - Jul 2026",
    tech: ["AWS", "GCP", "Kubernetes", "ArgoCD", "Terraform", "Firestore", "Valkey", "OpenTelemetry"],
    relatedPosts: ["ecs-to-eks-migration", "lgtm-stack-observability"],
    tasks: [
      {
        content: "Established Kubernetes operations through an **ECS-to-EKS migration** and built an **ArgoCD-based GitOps deployment flow** connecting builds, deployments, and completion notifications",
      },
      {
        content: "Worked on **AWS-to-GCP service migration**, moving backend, web, and notification services to GKE and adapting deployment, cache connections, and authentication to the new environment",
      },
      {
        content: "**Used a WAF to block web attacks and managed security rules with Terraform**, moving credentials into a secrets management service instead of storing them in code",
      },
      {
        content: "Decoupled notification storage from DynamoDB through a storage interface and implemented a **Firestore adapter and data migration tools**",
        details: [
          "Designed for compatibility with existing queries, conditional updates, and scheduled-notification behavior, and wrote emulator-based regression tests",
          "Implemented backfill, incremental synchronization, and pre-migration checks; disabled queue consumers and schedulers during migration to separate it from live notification delivery",
        ],
      },
      {
        content: "Built an **LGTM observability stack** to reduce Datadog cost, connecting logs, traces, and metrics through MDC and trace IDs",
        details: [
          "Stabilized migrated services by adjusting JVM memory, resource settings, and log and metric collection paths for GKE",
        ],
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
  aiNativeWorkflow: AI_NATIVE_WORKFLOW,
  skills: SKILLS,
  companies: COMPANIES,
  certifications: CERTIFICATIONS,
  projects: PROJECTS,
}

const EN_RESUME: ResumeData = {
  profile: EN_PROFILE,
  aiNativeWorkflow: EN_AI_NATIVE_WORKFLOW,
  skills: SKILLS,
  companies: EN_COMPANIES,
  certifications: EN_CERTIFICATIONS,
  projects: EN_PROJECTS,
}

export function getResumeData(language: Language): ResumeData {
  return language === "en" ? EN_RESUME : KO_RESUME
}
