import type { Language } from "../i18n/translations"
import type { PostMeta } from "../types/post"

type Localized = Record<Language, string>
interface TopicArticle { slug: string; reason: Localized }
interface TopicSection { title: Localized; description: Localized; articles: TopicArticle[] }
export interface Topic {
  slug: string
  title: Localized
  description: Localized
  introduction: Localized
  audience: Localized
  questions: Record<Language, string[]>
  sections: TopicSection[]
  updated: string
}

export const TOPICS_COPY = {
  ko: {
    title: "주제별 읽기 안내",
    description: "인증 설계, Spring AI, 클라우드 이전을 직접 구현하고 운영한 기록을 문제와 읽는 순서에 맞춰 안내합니다.",
    introduction: "지금 해결할 문제에서 시작해 보세요. 각 안내는 설계 배경부터 구현, 운영 중 마주친 한계까지 이어서 읽을 수 있도록 글을 묶었습니다.",
    audience: "이런 상황에서 읽어보세요",
    questions: "이 안내에서 다루는 질문",
    order: "추천 읽기 순서",
    open: "읽기 안내 보기",
    more: "다른 주제 둘러보기",
    related: "이 글이 포함된 읽기 안내",
    updated: "안내 수정",
  },
  en: {
    title: "Topic reading guides",
    description: "Follow hands-on articles about authentication design, Spring AI, and cloud migration, organized by the problem and reading order.",
    introduction: "Start with the problem you need to solve. Each guide connects design choices, implementation, and limitations encountered in operation.",
    audience: "When to use this guide",
    questions: "Questions covered",
    order: "Suggested reading order",
    open: "Explore the guide",
    more: "Explore other topics",
    related: "Reading guides for this article",
    updated: "Guide updated",
  },
} as const

export function topicPath(slug: string | undefined, language: Language) {
  return `${language === "en" ? "/en" : ""}/topics/${slug ? `${slug}/` : ""}`
}

export const TOPICS: Topic[] = [
  {
    slug: "authentication",
    title: { ko: "로그인과 JWT 인증 설계", en: "Login and JWT authentication design" },
    description: { ko: "로그인 책임 분리, OAuth authorize·callback, JWT 검증과 JWKS·KMS 전환을 실제 적용 순서에 따라 읽는 안내입니다.", en: "A reading path through login ownership, OAuth authorize and callback flows, JWT verification, and a JWKS/KMS migration." },
    introduction: { ko: "로그인 화면이 동작하는 것과 인증의 책임이 명확한 것은 다른 문제입니다. 이 안내는 프론트엔드가 맡던 로그인 처리를 백엔드로 옮기고, 로그인 진입과 콜백을 분리한 뒤 토큰 검증과 서명키 운영으로 범위를 넓혀갑니다. 각 글의 전환 배경과 경계를 먼저 읽고 구현을 따라가면 변경이 필요한 지점을 판단하기 쉽습니다.", en: "A working login screen does not settle who owns authentication. This guide starts with moving login responsibilities to the backend, separates authorization entry from callback handling, and then covers token verification and signing-key operations. Read the motivation and boundaries before following the implementation." },
    audience: { ko: "프론트와 백엔드에 로그인 로직이 흩어져 있거나, 토큰 검증·서명키 운영 방식을 바꾸려는 개발자를 위한 안내입니다.", en: "For developers with login logic spread across frontend and backend services, or planning changes to token verification and signing-key management." },
    questions: { ko: ["로그인 상태와 리다이렉트는 누가 책임져야 할까?", "authorize와 callback은 어떤 일을 나눠 맡을까?", "JWT 검증 방식과 서명키 배포를 어떻게 전환할까?"], en: ["Who should own login state and redirects?", "How should authorize and callback responsibilities be separated?", "How can verification and signing-key distribution be migrated?"] },
    updated: "2026-11-03",
    sections: [
      {
        title: { ko: "1. 로그인 책임과 요청 흐름 정리", en: "1. Establish ownership and request flow" },
        description: { ko: "어느 계층이 무엇을 결정하는지 정한 다음, 로그인 진입과 외부 인증 응답이 돌아오는 경로를 살펴봅니다.", en: "Define which layer makes each decision, then follow the login entry and the returning identity-provider response." },
        articles: [
          { slug: "backend-owned-login-flow", reason: { ko: "로그인 책임을 옮긴 배경과 프론트·백엔드의 역할부터 확인합니다.", en: "Start with the reasons for moving login ownership and the roles of each layer." } },
          { slug: "auth-authorize-callback-flow", reason: { ko: "authorize와 callback의 역할을 나눠 실제 요청 흐름을 따라갑니다.", en: "Trace the request flow through the separate authorize and callback responsibilities." } },
        ],
      },
      {
        title: { ko: "2. 토큰 검증과 키 운영 전환", en: "2. Migrate token verification and key operations" },
        description: { ko: "로그인 후 요청을 검증하는 방식과, 여러 서비스에 서명키를 배포하는 방식을 이어서 읽습니다.", en: "Continue with verifying authenticated requests and distributing signing-key information across services." },
        articles: [
          { slug: "auth-token-verification-migration", reason: { ko: "기존 검증 경로를 바꿀 때의 책임과 전환 과정을 확인합니다.", en: "Examine responsibilities and rollout steps when changing the verification path." } },
          { slug: "jwt-hs256-to-rs256-jwks-kms", reason: { ko: "HS256에서 RS256으로 옮기며 JWKS와 KMS를 연결한 구현을 읽습니다.", en: "Read the implementation connecting JWKS and KMS during an HS256-to-RS256 migration." } },
        ],
      },
    ],
  },
  {
    slug: "spring-ai",
    title: { ko: "Spring AI 적용과 운영", en: "Building and operating with Spring AI" },
    description: { ko: "ChatClient 설정부터 모델 공급자 분리, 구조화 출력, 실제 AI 파이프라인과 CS 상담 보조 운영까지 연결하는 읽기 안내입니다.", en: "A path from ChatClient setup, provider separation, and structured output to production AI pipelines and customer-support assistance." },
    introduction: { ko: "모델 호출 한 번을 성공시키고 나면 서비스의 데이터와 처리 흐름에 연결하는 일이 남습니다. 설정과 응답 형식을 먼저 익힌 뒤 실제 파이프라인, 상담 초안 생성과 운영자 검수로 이어지는 사례를 읽도록 구성했습니다. 예제의 API 사용법과 운영 사례에서 선택한 경계를 구분해 읽으면 자신의 서비스에 필요한 부분을 고르기 쉽습니다.", en: "After the first successful model call, the work is connecting it to service data and workflows. Begin with configuration and response formats, then follow real pipelines and a support-drafting system with operator review. Distinguish API examples from the operational boundaries chosen for those systems." },
    audience: { ko: "Spring 서비스에 LLM을 처음 연결하거나, 동작하는 예제를 실제 운영 흐름으로 발전시키려는 개발자에게 맞습니다.", en: "For developers adding an LLM to a Spring service or taking a working example into an operational workflow." },
    questions: { ko: ["ChatClient와 모델 공급자는 어떻게 구성할까?", "모델 응답을 서비스가 처리할 수 있는 형식으로 받을 수 있을까?", "실제 운영에서 조회·초안 생성·검수의 경계를 어떻게 잡을까?"], en: ["How should ChatClient and model providers be configured?", "How can responses be returned in a service-friendly structure?", "Where should lookup, drafting, and review boundaries sit in operation?"] },
    updated: "2026-11-03",
    sections: [
      {
        title: { ko: "1. 호출과 응답의 기본기", en: "1. Set up calls and response formats" },
        description: { ko: "설정 → 공급자 분리 → 프롬프트와 구조화 출력 순서로 읽습니다. 자신의 환경과 다른 버전·설정은 적용 전에 확인하세요.", en: "Read setup, provider separation, then prompts and structured output. Check version and configuration differences before adapting the examples." },
        articles: [
          { slug: "spring-ai-guide-01-setup", reason: { ko: "프로젝트 설정과 첫 ChatClient 호출부터 시작합니다.", en: "Start with project setup and the first ChatClient call." } },
          { slug: "spring-ai-guide-02-multi-provider", reason: { ko: "여러 모델 공급자를 다루는 구성과 역할 분리를 읽습니다.", en: "Explore configuration and separation of responsibilities for multiple providers." } },
          { slug: "spring-ai-guide-03-prompt-structured-output", reason: { ko: "프롬프트와 구조화 출력으로 응답 처리의 기준을 잡습니다.", en: "Use prompts and structured output to establish a response-handling contract." } },
        ],
      },
      {
        title: { ko: "2. 서비스 파이프라인과 운영자 검수", en: "2. Connect pipelines and operator review" },
        description: { ko: "모델 호출이 실제 서비스에서 어떤 단계에 들어가는지, 실패와 사람의 판단을 어디서 다루는지 살펴봅니다.", en: "Follow where model calls fit into a service and where failures and human decisions are handled." },
        articles: [
          { slug: "spring-ai-pipeline-real-world", reason: { ko: "실제 서비스에 모델 호출과 후속 처리를 연결한 사례를 읽습니다.", en: "Read how model calls and downstream processing were connected in a real service." } },
          { slug: "spring-ai-cs-automation", reason: { ko: "고객 정보 조회, 초안 생성, QA와 운영자 검수까지 운영 경계를 확인합니다.", en: "Examine operational boundaries across customer lookups, drafting, QA, and operator review." } },
        ],
      },
    ],
  },
  {
    slug: "cloud-migration",
    title: { ko: "클라우드 이전과 배포 운영", en: "Cloud migration and deployment operations" },
    description: { ko: "ECS에서 EKS로의 전환, GitOps 배포, 관측성 구축과 AWS에서 GCP로의 이전 경험을 연결하는 읽기 안내입니다.", en: "Connect hands-on articles about moving from ECS to EKS, GitOps deployments, and building observability for service operations." },
    introduction: { ko: "클라우드 이전은 리소스를 새 환경에 만드는 작업에 그치지 않습니다. 배포 방법, 설정과 데이터 연결, 장애를 확인하는 기준까지 함께 바뀝니다. 이 안내는 컨테이너 운영 환경의 전환과 배포 자동화를 먼저 읽고, 로그·메트릭·트레이스를 확인하는 체계를 거쳐 클라우드 간 이전 사례로 이어집니다.", en: "Cloud migration changes more than the resources running a service. Deployment procedures, configuration, data connections, and failure investigation change too. Start with the container-platform migration and deployment automation, then study how logs, metrics, and traces support operations." },
    audience: { ko: "컨테이너 운영 환경이나 클라우드를 옮기면서 배포·관측성까지 함께 정리하려는 개발자를 위한 안내입니다.", en: "For developers moving a container platform or cloud environment while also revisiting deployment and observability." },
    questions: { ko: ["ECS에서 EKS로 옮기며 어떤 운영 기준이 달라졌을까?", "GitOps 배포에 승인 흐름을 어떻게 연결할까?", "이전 후 문제를 확인할 로그·메트릭·트레이스는 어떻게 준비할까?"], en: ["Which operational choices changed during an ECS-to-EKS migration?", "How can approval flows be connected to GitOps deployment?", "How can logs, metrics, and traces be prepared for investigating failures?"] },
    updated: "2026-11-03",
    sections: [
      {
        title: { ko: "1. 운영 환경과 배포 경로 전환", en: "1. Move the platform and deployment path" },
        description: { ko: "환경을 바꾼 이유를 먼저 확인하고, 배포 변경을 승인하고 반영하는 흐름으로 이어갑니다.", en: "Understand why the platform changed, then follow the flow for approving and applying deployments." },
        articles: [
          { slug: "ecs-to-eks-migration", reason: { ko: "ECS에서 EKS로 옮기며 바꾼 운영 구성을 확인합니다.", en: "Review the operational configuration changes made while moving from ECS to EKS." } },
          { slug: "gitops-argocd-n8n-deployment", reason: { ko: "Argo CD와 n8n으로 GitOps·Slack 승인 배포를 연결한 과정을 읽습니다.", en: "Read how Argo CD and n8n connected GitOps deployments with Slack approvals." } },
        ],
      },
      {
        title: { ko: "2. 변경 결과를 관측하는 체계", en: "2. Observe the results of changes" },
        description: { ko: "구성 요소의 역할을 먼저 이해한 다음 구축 과정을 읽으면, 자신의 환경에서 필요한 신호를 고르기 쉽습니다.", en: "Understand each component's role before the setup guide so you can choose the signals needed in your own environment." },
        articles: [
          { slug: "lgtm-stack-observability", reason: { ko: "LGTM 스택에서 로그·메트릭·트레이스가 맡는 역할을 살펴봅니다.", en: "Explore the roles of logs, metrics, and traces in the LGTM stack." } },
          { slug: "lgtm-stack-setup-guide", reason: { ko: "관측성 구성 요소를 실제로 연결하는 구축 과정을 읽습니다.", en: "Follow the setup process for connecting observability components." } },
        ],
      },
      {
        title: { ko: "3. 클라우드 간 이전으로 범위 넓히기", en: "3. Extend the scope to a cross-cloud migration" },
        description: { ko: "AWS에서 GCP로 옮기며 런타임·배포·데이터 연결의 기준이 달라진 사례를 읽습니다.", en: "Read about changes to runtime, deployment, and data connections during an AWS-to-GCP migration." },
        articles: [{ slug: "aws-to-gcp-migration", reason: { ko: "앞선 운영 기준을 클라우드 간 이전 사례와 비교해 봅니다.", en: "Compare the operational considerations with a cross-cloud migration." } }],
      },
    ],
  },
]

// Resolve against the published language-specific catalogue; never link a draft,
// scheduled article, or a translation-unavailable placeholder from a guide.
export function topicSections(topic: Topic, posts: PostMeta[]) {
  const bySlug = new Map(posts.map(post => [post.slug, post]))
  return topic.sections.map(section => ({
    ...section,
    articles: section.articles.flatMap(article => {
      const post = bySlug.get(article.slug)
      return post ? [{ ...article, post }] : []
    }),
  })).filter(section => section.articles.length > 0)
}
