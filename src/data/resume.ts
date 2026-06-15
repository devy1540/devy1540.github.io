export interface ProjectSummary {
  slug: string
  name: string
  period: string
  summary: string
}

export interface Company {
  name: string
  role: string
  period: string
  highlights?: string[]
  projects: ProjectSummary[]
}

export interface TaskItem {
  content: string
  details?: string[]
}

export interface RelatedLink {
  title: string
  url: string
}

export interface ProjectDetail {
  slug: string
  company: string
  name: string
  period: string
  tech: string[]
  tasks: TaskItem[]
  achievements?: string[]
  relatedPosts?: string[]
  relatedLinks?: RelatedLink[]
}

export interface Certification {
  name: string
  year: string
}

export const PROFILE = {
  name: "윤혁준",
  phone: "010-6709-1540",
  github: "https://github.com/devy1540",
  linkedin: "https://www.linkedin.com/in/%ED%98%81%EC%A4%80-%EC%9C%A4-21a3bb22a/",
  email: "gurwns1540@gmail.com",
  introduction:
    "비즈니스 요구를 결제·예약·수업·알림 같은 제품 기능으로 풀어내고, 안정적으로 확장되는 서비스 구조까지 설계하는 백엔드 엔지니어입니다.\n레거시 결제·인증 구조를 Java/Spring 기반으로 전환하고, 운영 리스크가 큰 도메인을 관측 가능하고 변경에 강한 구조로 정비해왔습니다.\n최근에는 LLM 파이프라인과 AI 코드리뷰 자동화를 프로덕션에 적용하며, 제품 품질과 개발 생산성을 함께 높이는 시스템을 만들고 있습니다.",
}

export const SKILLS: Record<string, string[]> = {
  Backend: ["Java", "Spring Boot", "QueryDSL", "MyBatis", "JPA", "Kafka"],
  Infrastructure: ["AWS", "Kubernetes", "Docker", "ArgoCD", "Terraform", "Nginx"],
  Database: ["PostgreSQL", "Redis", "DynamoDB", "Apache Druid"],
  "AI / LLM": ["OpenAI", "Gemini", "AWS Bedrock"],
  Monitoring: ["Grafana", "Loki", "Tempo", "Mimir", "OpenTelemetry", "Prometheus"],
  Tools: ["Git", "GitHub Actions", "JMeter", "Notion"],
}

export const COMPANIES: Company[] = [
  {
    name: "주식회사 데이원컴퍼니",
    role: "Backend Engineer",
    period: "2024.08 — 현재",
    highlights: [
      "결제·인증·수업·온보딩을 잇는 **핵심 사용자 흐름 재설계**",
      "레거시 PHP 결제·인증 기능을 Java/Spring으로 이관하고 **PHP 운영 의존성 제거**",
      "AI 진단 파이프라인으로 **CS 인입 98% 감소**, 멀티채널 알림서버로 **중복 발송률 0% 달성**",
      "쿠폰·구독·레슨권 도메인을 메타/세그먼트 기반으로 정비해 **운영 자동화와 상품 확장성 확보**",
      "Facade 계층·공통 응답/에러 규칙을 정립해 **도메인 변경 범위와 협업 비용 축소**",
      "ECS→EKS, ArgoCD GitOps, LGTM 모니터링 스택, WAF/Secrets 전환으로 **운영 플랫폼 현대화**",
    ],
    projects: [
      { slug: "ai-diagnostic-pipeline", name: "AI 진단/피드백 파이프라인 구축", period: "2025.10 — 2026.01", summary: "7단계 AI 파이프라인 재설계, CS 98% 감소" },
      { slug: "payment-system", name: "결제 시스템 전면 재설계", period: "2025.03 — 2025.09", summary: "PHP→Java 전면 이관, 중복 결제 0건 달성" },
      { slug: "notification-server", name: "멀티채널 알림서버 신규 구축", period: "2025.06 — 2025.10", summary: "4채널 통합 독립 알림서버 0→1 구축, 중복 발송률 0%" },
      { slug: "personalization-system", name: "사용자 데이터 기반 개인화 시스템 구축", period: "2025.01 — 2026.01", summary: "세그멘테이션 기반 차등 쿠폰·해지방어 시스템" },
      { slug: "onboarding-trial-flow", name: "온보딩 및 체험레슨 예약 플로우 고도화", period: "2026.04 — 2026.05", summary: "첫 수업 예약·예습·입장 상태 정합성 개선" },
      { slug: "auth-refactoring", name: "인증 시스템 리팩토링 및 레거시 전환", period: "2024.09 — 2025.05", summary: "PHP 세션→JWT 기반 인증 전면 재설계" },
      { slug: "dev-process", name: "개발 프로세스 개선", period: "2024.09 — 2026.02", summary: "Facade 패턴 도입, 응답/에러 공통화, 메타 기반 도메인 재설계" },
      { slug: "infra-modernization", name: "서비스 인프라 현대화 및 보안 체계 구축", period: "2025.10 — 2026.01", summary: "ECS→EKS 마이그레이션, WAF·GitOps 구축" },
    ],
  },
  {
    name: "주식회사 엑셈",
    role: "Backend Engineer",
    period: "2020.07 — 2024.05",
    highlights: [
      "K8s 모니터링 API 호출 **최대 90% 개선**, CloudMOA 제품 출시",
      "Kafka Stream + Apache Druid 파이프라인 구축, 초당 **45,000건** 성능저하 없이 처리",
      "SaaS형 모니터링 서비스 **DataSaker** 제품 출시, MSA 공통 라이브러리 구축",
      "DPM 시스템 쿼리 최적화로 대량 데이터 조회 **100ms~3s 이내** 응답 달성",
    ],
    projects: [
      { slug: "dpm-monitoring", name: "온프레미스형 DPM 모니터링 시스템 리팩토링", period: "2024.01 — 2024.05", summary: "쿼리 최적화로 100ms~3s 이내 응답 달성" },
      { slug: "saas-monitoring", name: "SaaS형 모니터링 서비스 비즈니스 로직 구현", period: "2021.09 — 2023.12", summary: "멀티테넌트 모니터링 서비스 구현, DataSaker 출시" },
      { slug: "data-pipeline", name: "SaaS형 모니터링 서비스 데이터 수집 파이프라인 구축", period: "2021.01 — 2021.09", summary: "Kafka Stream + Apache Druid 파이프라인 구축" },
      { slug: "k8s-monitoring", name: "쿠버네티스 모니터링 시스템 개발", period: "2020.08 — 2021.01", summary: "API 호출 90% 개선, CloudMOA 제품 출시" },
    ],
  },
]

export const CERTIFICATIONS: Certification[] = [
  { name: "AWS Certified Developer - Associate", year: "2023" },
  { name: "CKA (Certified Kubernetes Administrator)", year: "2022" },
  { name: "SQLD", year: "2022" },
  { name: "정보처리기사", year: "2019" },
]

export const PROJECTS: ProjectDetail[] = [
  {
    slug: "ai-diagnostic-pipeline",
    company: "주식회사 데이원컴퍼니",
    name: "AI 진단/피드백 파이프라인 구축",
    period: "2025.10 — 2026.01",
    tech: ["Spring AI", "Gemini", "Amazon Bedrock", "OpenAI", "Spring Boot"],
    relatedPosts: ["spring-ai-pipeline-real-world"],
    tasks: [
      {
        content: "HTTP 직접 호출과 동기 단일 프롬프트에 묶여 있던 진단 프로세스를 **Spring AI** 기반 **7단계 AI 파이프라인**(STT 로드 → Semantic Chunking → STT 보정 → 지표 산출 → LLM 피드백 → 문제 생성 → 알림)으로 재설계",
        details: [
          "진단 품질 개선으로 **CS 인입 98% 감소**",
          "기존 Java/Spring 환경 안에서 운영할 수 있게 통합해 유지보수 부담과 개발 난이도 완화",
          "파이프라인 단계를 비동기로 분리해 병목을 줄이고 처리 시간 안정화",
        ],
      },
      {
        content: "Gemini·Amazon Bedrock·OpenAI 모델을 단계별 역할에 맞게 배치하고, 백오피스에서 **모델·프롬프트를 무중단 변경**할 수 있는 구조 설계",
        details: [
          "**LLM 비용 약 50% 절감**",
        ],
      },
      {
        content: "AI 할루시네이션 보정 단계와 포맷 검증 실패 재시도 로직 추가",
        details: [
          "진단 리포트 생성 시간 **6~7분 → 1~2분** (약 75% 단축)",
        ],
      },
    ],
  },
  {
    slug: "payment-system",
    company: "주식회사 데이원컴퍼니",
    name: "결제 시스템 전면 재설계",
    period: "2025.03 — 2025.09",
    tech: ["Java", "Spring Boot", "Redis", "Portone"],
    tasks: [
      {
        content: "PHP 레거시 결제 시스템을 Java/Spring으로 이관하고, PortOne v1에서 v2로 점진 전환하면서 하위 호환성 유지",
      },
      {
        content: "결제 승인·검증·후처리 단계를 명확히 분리하고 API 기반 처리 흐름으로 재설계해 결제 상태 추적과 트랜잭션 경계를 단순화",
      },
      {
        content: "Redis Lock 기반 멱등성 체크와 Webhook + Polling 이중 검증으로 동시 결제와 PG사 응답 지연에 대응해 **중복 결제 0건** 달성",
      },
      {
        content: "자동 환불·쿠폰 복구·보상권 복구 등 결제 엣지케이스 방어 로직을 설계해 결제 관련 **CS 이슈 90% 감소**",
      },
      {
        content: "결제 흐름을 enum 기반 타입별 처리로 단일화해 **신규 결제 수단 연동 공수 50% 이상 감소**",
      },
      {
        content: "구독 만료일 계산 알고리즘을 구현하고 단위 테스트로 검증",
        details: [
          "매월 말일 수동 보정 작업 제거",
        ],
      },
    ],
  },
  {
    slug: "notification-server",
    company: "주식회사 데이원컴퍼니",
    name: "멀티채널 알림서버 신규 구축",
    period: "2025.06 — 2025.10",
    tech: ["Spring Boot", "SQS", "Redis", "DynamoDB"],
    relatedPosts: ["multi-channel-notification-server"],
    tasks: [
      {
        content: "카카오톡·SMS·앱푸시·Slack 등 **N개 채널을 통합**하는 독립 알림서버를 0→1로 설계하고, 백엔드·PHP에 흩어진 알림 로직을 **Java/Spring** 기반 서비스로 통합",
      },
      {
        content: "**SQS 기반 이벤트 드리븐 구조**와 DLQ를 구성해 대량 발송 상황에서도 알림 누락 없이 처리",
      },
      {
        content: "enum 기반 채널 라우팅과 클라이언트 SDK를 설계해 신규 알림 추가 시 등록 지점을 최소화",
      },
      {
        content: "**Java Reflection**과 어노테이션 기반 매핑으로 알림 템플릿 변수를 객체 필드와 자동 치환하는 SDK 구성",
      },
      {
        content: "백오피스에서 알림 메시지와 발송 설정을 관리할 수 있는 기능과 메뉴 신설",
      },
      {
        content: "Redis Lock 기반 멱등성 체크로 **중복 발송률 0%** 달성, 중복제거로 인한 카카오 알림 비용 **10% 절감**",
      },
      {
        content: "AWS DynamoDB 기반 이력 관리와 사용자별 예약 알림 기능 구현",
      },
    ],
  },
  {
    slug: "personalization-system",
    company: "주식회사 데이원컴퍼니",
    name: "사용자 데이터 기반 개인화 시스템 구축",
    period: "2025.01 — 2026.01",
    tech: ["Spring Boot", "Redis", "PostgreSQL", "AWS Lambda"],
    tasks: [
      {
        content: "수강 이력 기반 사용자 세그먼트 엔진을 구축하고 세그먼트별 차등 쿠폰 자동 발급",
        details: [
          "일괄 cron 발급 방식에서 조건 기반 자동 발급으로 전환해 마케팅/운영 액션을 세분화",
        ],
      },
      {
        content: "사용자 보유 쿠폰을 계산해 가격표와 결제단에 최대 할인 금액 자동 반영",
        details: [
          "별도 쿠폰 선택 없이 최적 할인 금액을 보여줘 구매 진입 장벽 완화",
        ],
      },
      {
        content: "사용자 효능감 강화를 위한 수강증 발급 기능 추가",
        details: [
          "웹훅 요청을 정제·적재하고 AWS Lambda로 PDF를 생성해 사용자에게 이메일 발송",
        ],
      },
    ],
  },
  {
    slug: "onboarding-trial-flow",
    company: "주식회사 데이원컴퍼니",
    name: "온보딩 및 체험레슨 예약 플로우 고도화",
    period: "2026.04 — 2026.05",
    tech: ["React", "TypeScript", "Spring Boot", "Playwright", "Feature Flag"],
    tasks: [
      {
        content: "체험레슨 예약·예습·입장 상태를 홈 온보딩과 수업 도메인에 연결해 신규 사용자의 첫 수업 진입 경로 정비",
      },
      {
        content: "온보딩 feature flag를 기준으로 신규 플로우와 기존 체험 로직을 병행 운영할 수 있게 설계",
        details: [
          "플래그 비활성 시 기존 체험 로직을 그대로 보존해 stage/prod 전환 리스크를 낮춤",
        ],
      },
      {
        content: "예약된 체험레슨 카드, 추가 체험 CTA, 예습/입장 라우팅, 레벨 동기화 등 상태 불일치가 잦은 케이스 정리",
      },
      {
        content: "백엔드 OnboardingService getState 동기화에서 lecture 시작 시각을 함께 비교하고, 온보딩 비활성 조건에서도 기존 체험 상태 계산 유지",
      },
      {
        content: "Playwright E2E와 단위 테스트로 예약·재사용·유료 사용자 보호 조건·stage 진입 조건 검증",
      },
    ],
    achievements: [
      "신규 온보딩 플로우와 기존 체험 플로우를 feature flag 기반으로 함께 운영할 수 있는 구조 마련",
      "예약 상태와 수업 입장 경로의 정합성을 높여 첫 수업 진입 과정의 예외 케이스 축소",
    ],
  },
  {
    slug: "auth-refactoring",
    company: "주식회사 데이원컴퍼니",
    name: "인증 시스템 리팩토링 및 레거시 전환",
    period: "2024.09 — 2025.05",
    tech: ["Java", "Spring Boot", "Spring OAuth2", "JWT", "Redis"],
    tasks: [
      {
        content: "PHP 세션과 프론트엔드 토큰 발급 구조를 **JWT 기반 서버사이드 인증**으로 재설계하고 Refresh Token Rotation 적용",
      },
      {
        content: "인증·사용자 관리·API 라우팅 등 PHP 레거시 기능을 Java로 이관해 PHP/Java 이중 운영 해소",
      },
      {
        content: "PHP 세션 문제로 타 사용자 계정 정보가 노출되던 **보안 이슈 원천 해결**",
      },
      {
        content: "Spring OAuth2 기반 인증 흐름 정립",
        details: [
          "카카오 로그인 후 서비스 자체 토큰으로 전환해 인증 처리",
          "Google Login 추가를 고려한 확장 구조 마련",
          "서비스 자체 OAuth 인증으로 통합해 유지보수성과 운영 효율 개선",
        ],
      },
    ],
  },
  {
    slug: "dev-process",
    company: "주식회사 데이원컴퍼니",
    name: "개발 프로세스 개선",
    period: "2024.09 — 2026.02",
    tech: ["Java", "Spring Boot"],
    relatedPosts: ["spring-facade-pattern-layered-architecture", "api-response-error-standardization"],
    tasks: [
      {
        content: "Spring MVC 구조에 **Facade 계층**을 도입해 Controller -> Facade(gateway) -> Service -> Repository 개발 규칙 정립",
        details: [
          "Service와 Repository는 도메인별 책임을 유지하고, 여러 서비스 조합은 Facade에서 처리",
          "중복 비즈니스 로직을 줄이고 도메인 로직 재사용성 개선",
        ],
      },
      {
        content: "응답/에러 처리 구조 공통화",
        details: [
          "200 응답 안에 4xx/5xx 상태를 담던 방식을 HTTP 상태 코드 기반 응답으로 전환",
          "모니터링에서 응답 코드별 API 호출 추적이 가능해져 장애 대응 속도 개선",
          "응답/에러 포맷을 표준화해 프론트엔드와 백엔드 간 커뮤니케이션 비용 감소",
        ],
      },
      {
        content: "하드코딩된 상품 구조를 **메타 데이터 기반** 수강권 도메인으로 재설계해 신규 상품(더블팩, 일본어 등)을 코드 수정 없이 출시할 수 있는 구조 마련",
      },
      {
        content: "레슨권 어드민을 고도화하고 공통 로직을 통합해 운영팀 **레슨권 관리 작업 시간 50% 이상 단축**",
      },
      {
        content: "KST 기준으로 동작하던 시간을 UTC 기준으로 전환해 해외 사용자 시차와 타임존 처리 문제 개선",
      },
    ],
  },
  {
    slug: "infra-modernization",
    company: "주식회사 데이원컴퍼니",
    name: "서비스 인프라 현대화 및 보안 체계 구축",
    period: "2025.10 — 2026.01",
    tech: ["Kubernetes", "ArgoCD", "Terraform", "Grafana", "Loki", "Tempo", "Mimir", "OpenTelemetry", "AWS WAF"],
    relatedPosts: ["ecs-to-eks-migration", "lgtm-stack-observability"],
    tasks: [
      {
        content: "ECS → EKS 마이그레이션을 수행하고 kustomize + K8s Gateway API 기반 운영 환경 구성. **ArgoCD 기반 GitOps** 배포 파이프라인 구축(PR 머지 → 빌드 → 배포 → Slack 알림 자동화)",
      },
      {
        content: "SQL Injection 등 웹 공격 탐지 후 **AWS WAF**를 도입하고 Terraform으로 룰셋 코드화. Secrets Manager 전환으로 코드 내 민감 정보 제거",
      },
      {
        content: "Datadog 비용 부담을 줄이기 위해 **LGTM 모니터링 스택**(Grafana·Loki·Tempo·Mimir)을 구축하고 서버 기본 지표 대시보드 추가",
      },
      {
        content: "MDC 기반 요청 추적 로그를 도입해 트레이스 ID 기준으로 로그·트레이스·메트릭을 함께 추적할 수 있는 환경 구성",
      },
    ],
  },
  {
    slug: "dpm-monitoring",
    company: "주식회사 엑셈",
    name: "온프레미스형 DPM 모니터링 시스템 리팩토링",
    period: "2024.01 — 2024.05",
    tech: ["Java", "Spring Boot", "MyBatis", "PostgreSQL"],
    tasks: [
      { content: "MyBatis 대량 파라미터로 쿼리 크기 제한에 걸리던 문제를 서브쿼리 구조로 개선" },
      { content: "여러 건으로 나뉘던 조회 쿼리를 단일 쿼리로 통합해 응답 성능 개선" },
      { content: "데이터베이스 분석 도구의 핵심 비즈니스 로직 구현" },
    ],
    achievements: [
      "대량 데이터 조회 성능을 개선해 100ms~3s 이내 응답 달성",
      "데이터베이스 상태와 분석 메트릭을 시각화해 사용자 화면에 제공",
    ],
  },
  {
    slug: "saas-monitoring",
    company: "주식회사 엑셈",
    name: "SaaS형 모니터링 서비스 비즈니스 로직 구현",
    period: "2021.09 — 2023.12",
    tech: ["Java", "Spring Boot", "Keycloak", "OpenAPI"],
    tasks: [
      { content: "사용자·테넌트 메타 관리 기능 구현" },
      { content: "모니터링 기능과 사용자용 대시보드 작성 기능 구현" },
      { content: "OpenAPI 기반 API 명세를 관리해 백엔드와 프론트엔드 코드 포맷 일관성 유지" },
      { content: "SaaS 서비스 상태를 확인할 수 있는 SLA 기능 구현" },
      { content: "품질 관리를 위한 미들웨어 로그 분석기 기능 구현" },
      { content: "MSA 환경에서 공통 코드 재사용을 위한 라이브러리 제작·배포" },
      { content: "사내 라이브러리 관리를 위한 Nexus Repository 구축" },
    ],
    achievements: [
      "서비스별 모니터링 기능을 구현해 사용자에게 제공",
      "Keycloak 기반 로그인과 SSO 기능 제공",
      "관리자가 테넌트를 만들고 사용자를 초대할 수 있는 관리 기능 구현",
      "API 명세 기반 협업으로 프론트엔드 연동 비용 절감",
      "SLA 기능으로 분산 서버 상태를 실시간 확인",
      "Apache Druid 로그를 수집해 일일 리포트 이메일 발송",
      "공통 라이브러리로 중복 코드를 줄이고 팀 생산성 개선",
    ],
  },
  {
    slug: "data-pipeline",
    company: "주식회사 엑셈",
    name: "SaaS형 모니터링 서비스 데이터 수집 파이프라인 구축",
    period: "2021.01 — 2021.09",
    tech: ["Kafka Stream", "Apache Druid", "Spring Boot", "Kubernetes"],
    relatedLinks: [{ title: "Apache Druid 기고문", url: "https://ex-em.com/ko/academy/Part.1-Druid" }],
    tasks: [
      { content: "Kafka Stream으로 Kafka 수집 데이터를 재가공해 서비스별 조회 데이터 생성" },
      { content: "Apache Druid로 실시간 데이터를 수집·저장하고 조회 가능한 상태로 관리" },
      { content: "제한된 인프라에서 Apache Druid 수집/조회 경로를 분리해 성능 최적화" },
      { content: "메모리 사용량 기반 Kubernetes scale in/out을 구성해 부하 변화에도 무중단 운영" },
    ],
    achievements: [
      "Kafka Stream을 Spring Boot로 구현해 유지보수성 확보",
      "서버별 데이터 가공 로직 중복을 줄이고 생산성 개선",
      "공식 권장 스펙의 약 1/2 규모에서도 초당 45,000건 처리 성능 유지",
      "데이터 유실과 중복을 줄여 수집 정합성 유지",
    ],
  },
  {
    slug: "k8s-monitoring",
    company: "주식회사 엑셈",
    name: "쿠버네티스 모니터링 시스템 개발",
    period: "2020.08 — 2021.01",
    tech: ["Java", "Spring Boot", "QueryDSL", "Prometheus", "JMeter"],
    tasks: [
      { content: "Prometheus Multi Query로 N건의 메트릭 호출을 1~3건으로 축소" },
      { content: "JPA Native Query 기반 조회 로직에 QueryDSL 도입" },
      { content: "하드코딩과 비효율적인 로직을 줄이기 위해 디자인 패턴 적용" },
      { content: "쿠버네티스 자원 조회 비즈니스 로직 구현" },
      { content: "JMeter 기반 부하 테스트 수행" },
    ],
    achievements: [
      "API 호출 수 최대 90% 개선",
      "빌더 패턴으로 하드코딩을 줄이고 가독성 개선",
      "QueryDSL 도입으로 컴파일 시점의 쿼리 오류 확인 가능",
      "사내 테스트에서 약 50,000 TPS까지 성능 저하 없이 처리",
      "클라우드 모니터링 솔루션 CloudMOA 제품 출시",
    ],
  },
]
