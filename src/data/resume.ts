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

export interface AiNativeWorkflowItem {
  title: string
  description: string
}

export const PROFILE = {
  name: "윤혁준",
  phone: "010-6709-1540",
  github: "https://github.com/devy1540",
  linkedin: "https://www.linkedin.com/in/%ED%98%81%EC%A4%80-%EC%9C%A4-21a3bb22a/",
  email: "gurwns1540@gmail.com",
  introduction:
    "백엔드 시스템을 설계하고, AI를 실제 서비스와 업무에 적용하는 엔지니어입니다.\n결제·인증 시스템을 재설계하고, LLM 기반 진단과 상담 보조 기능을 서비스에 적용했습니다.\n반복적인 개발 업무를 줄이기 위해 개발·리뷰 에이전트를 구축했으며, E2E·감사 에이전트를 개발하고 있습니다.\n구현부터 테스트·배포·운영까지 직접 연결하고, 변경 결과는 실행 기록과 실제 동작으로 확인합니다.",
}

export const AI_NATIVE_WORKFLOW: AiNativeWorkflowItem[] = [
  {
    title: "요구사항을 운영되는 기능으로",
    description: "백엔드 설계와 구현을 중심으로 필요한 화면, 테스트, 배포·관측까지 연결합니다. 결제·인증과 AI 서비스의 운영 경험을 바탕으로 변경 범위를 판단합니다.",
  },
  {
    title: "에이전트가 협업하는 업무 흐름",
    description: "**개발과 리뷰의 책임을 나누고**, 요청 맥락과 수정 근거가 이어지도록 설계합니다. 사람이 판단할 조건과 에이전트가 진행할 범위를 함께 정리합니다.",
  },
  {
    title: "실행 근거로 확인하는 결과",
    description: "코드와 테스트, 실행 로그로 결과를 확인합니다. **PR 작성·배포·실제 해결을 구분**하고, 실패 사례는 재현과 재검증 기준으로 남깁니다.",
  },
]

export const SKILLS: Record<string, string[]> = {
  Backend: ["Java", "Spring Boot", "QueryDSL", "MyBatis", "JPA", "Kafka"],
  Frontend: ["React", "TypeScript", "Vite", "Tailwind CSS", "Playwright"],
  Infrastructure: ["AWS", "GCP", "Kubernetes", "Docker", "ArgoCD", "Terraform", "Nginx"],
  Database: ["PostgreSQL", "Redis", "DynamoDB", "Apache Druid"],
  "AI Engineering": ["Spring AI", "Function Calling", "OpenAI", "Gemini", "AWS Bedrock"],
  "Agent Engineering": ["Codex App Server", "Hermes Agent", "MCP", "Slack API"],
  Monitoring: ["Grafana", "Loki", "Tempo", "Mimir", "OpenTelemetry", "Prometheus"],
  Tools: ["Git", "GitHub Actions", "JMeter", "Notion"],
}

export const COMPANIES: Company[] = [
  {
    name: "주식회사 데이원컴퍼니",
    role: "Backend Engineer",
    period: "2024.08 — 현재",
    projects: [
      { slug: "ai-agent-workflow", name: "AI 에이전트 기반 개발·운영 워크플로우 개선", period: "2026 — 현재", summary: "개발·리뷰 에이전트 구축, E2E·감사 에이전트 개발 진행 중" },
      { slug: "cs-automation", name: "AI 기반 CS 상담 보조 시스템 구축", period: "2026.05 — 2026.07", summary: "초안·QA·오류 진단과 상담원 검수 흐름 구축, 적용 후 CS 처리량 약 43% 감소" },
      { slug: "ai-diagnostic-pipeline", name: "AI 진단/피드백 파이프라인 구축", period: "2025.10 — 2026.01", summary: "7단계 AI 파이프라인 재설계, CS 98% 감소" },
      { slug: "payment-system", name: "결제 시스템 전면 재설계", period: "2025.03 — 2025.09", summary: "PHP→Java 전면 이관, 중복 결제 0건 달성" },
      { slug: "global-expansion", name: "일본 시장 진출을 위한 서비스 현지화", period: "2026.06 — 2026.08", summary: "인증·앱 국제화·언어 및 시간대 처리·다국어 문서 발급 체계 구축 완료" },
      { slug: "infra-modernization", name: "서비스 인프라 현대화 및 보안 체계 구축", period: "2025.10 — 2026.07", summary: "ECS→EKS·AWS→GCP 이관, 저장소 전환, GitOps·보안·관측 체계 구축" },
      { slug: "notification-server", name: "멀티채널 알림서버 신규 구축", period: "2025.06 — 2025.10", summary: "4채널 통합 독립 알림서버 0→1 구축, 중복 발송률 0%" },
      { slug: "personalization-system", name: "사용자 데이터 기반 개인화 시스템 구축", period: "2025.01 — 2026.01", summary: "세그멘테이션 기반 차등 쿠폰·해지방어 시스템" },
      { slug: "onboarding-trial-flow", name: "온보딩 및 체험레슨 예약 플로우 고도화", period: "2026.04 — 2026.05", summary: "첫 수업 예약·예습·입장 상태 정합성 개선" },
      { slug: "auth-refactoring", name: "인증 시스템 리팩토링 및 레거시 전환", period: "2024.09 — 2026.04", summary: "레거시 인증 전환, 서명·검증 권한 분리" },
      { slug: "dev-process", name: "개발 프로세스 개선", period: "2024.09 — 2026.02", summary: "Facade 패턴 도입, 응답/에러 공통화, 메타 기반 도메인 재설계" },
    ],
  },
  {
    name: "주식회사 엑셈",
    role: "Backend Engineer",
    period: "2020.07 — 2024.05",
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
    slug: "ai-agent-workflow",
    company: "주식회사 데이원컴퍼니",
    name: "AI 에이전트 기반 개발·운영 워크플로우 개선",
    period: "2026 — 현재",
    tech: ["TypeScript", "Python", "Codex App Server", "Hermes Agent", "MCP", "Slack API", "SQLite"],
    tasks: [
      {
        content: "반복적인 맥락 전달과 후속 지시를 줄이기 위한 **개발·리뷰 에이전트 구축**, E2E·감사 에이전트로 업무 흐름 확장 중",
      },
      {
        content: "**Codex harness의 도구 실행·세션 관리·승인 흐름을 Slack에서도 재사용**하기 위해 Codex App Server 기반 개발 에이전트 구현",
        details: [
          "Slack으로 받은 개발 요청을 요구사항 분석·코드 수정·테스트·PR 작성까지 연결하고, 대화와 작업 세션을 매핑해 후속 요청의 맥락 유지",
          "원 요청과 최근 대화를 작업 입력에 전달하고, 작업별 저장소·worktree를 배정하는 흐름 구성",
        ],
      },
      {
        content: "**Hermes Agent 기반 독립 리뷰 에이전트 구축**: Slack Gateway와 GitHub·Slack 전용 MCP, PR·보안 리뷰 스킬을 연결",
        details: [
          "개발 에이전트와 제품 코드 수정 권한을 분리하고, 리뷰 결과에 따른 수정 요청·재검토·사람에게 넘길 조건 설계",
          "검토 대상 커밋을 고정하고 게시 전 최신 코드와 대조하며, 중복 리뷰 게시와 전송 결과가 불확실한 요청의 재전송 방지",
          "진행 로그와 최종 답변의 전달 경로를 분리하고, 중간 메시지의 멘션으로 봇이 재호출되지 않도록 Gateway 동작 보완",
        ],
      },
      {
        content: "**PR별 테스트 환경 준비부터 변경된 기능의 검증까지 자동화하는 E2E 에이전트 개발 중**",
        details: [
          "여러 저장소의 PR 브랜치를 묶어 웹·백엔드·어드민 테스트 환경을 자동 구성하고, 변경 범위에 맞는 Playwright 테스트를 선별 실행하도록 연계",
        ],
      },
      {
        content: "에이전트의 실행 기록과 산출물을 대조해 완료 여부·누락·반복 오류를 점검하는 **감사 에이전트 개발 중**",
      },
      {
        content: "**작업 결과와 메시지 전달 상태를 분리해 저장**하고, 전송 실패 시 코드 작업을 반복하지 않고 결과 전달을 복구하는 흐름 구현",
        details: ["권한·리뷰·배포 대기와 해결 확인을 구분하고, 다음 담당자와 조치를 결과에 연결"],
      },
      {
        content: "실제 실패를 재현하고 수정 전후에 같은 테스트와 정상 사례를 확인하는 **자가개선 스킬 작성**, 일일 점검으로 미완료 업무와 반복 오류를 추적하는 절차 정리",
      },
    ],
  },
  {
    slug: "global-expansion",
    company: "주식회사 데이원컴퍼니",
    name: "일본 시장 진출을 위한 서비스 현지화",
    period: "2026.06 — 2026.08",
    tech: ["Spring Boot", "Spring OAuth2", "React", "TypeScript", "GrowthBook", "GCS", "Cloud Run"],
    relatedPosts: ["i18n-01-foundation", "i18n-02-language-pack-gcs", "i18n-05-document-render"],
    tasks: [
      {
        content: "일본 사용자의 서비스 진입 경로를 넓히기 위해 **LINE·Google·Apple 소셜 로그인**을 추가하고 LINE 친구 추가 연동 구현",
      },
      {
        content: "언어별 문구를 앱 코드와 분리하는 **국제화(i18n) 기반 구축**, 앱 재배포 없이 번역을 갱신하도록 GCS 언어팩을 실행 시점에 불러오는 구조 설계",
        details: [
          "언어팩 로드 실패 시 번들에 포함된 문구로 대체하고, GrowthBook 킬스위치로 적용 범위 제어",
        ],
      },
      {
        content: "**사용자 언어·시간대 설정 API와 화면 구현**, 인증 정보에 언어 코드를 전달하고 홈 배너의 언어별 노출 조건 반영",
      },
      {
        content: "언어를 추가할 때마다 배경 이미지를 다시 만들던 수강확인증·레벨테스트 리포트를 **HTML 템플릿과 언어별 문자열로 분리**해 다국어 문서 발급 지원",
        details: [
          "백엔드는 발급 이벤트를 전달하고 Cloud Run 서비스가 HTML·언어별 문구를 PDF로 렌더링하도록 역할 분리",
        ],
      },
    ],
    achievements: [
      "일본 시장 진출에 필요한 백엔드·앱 현지화 작업 완료",
      "번역 문구는 앱 재배포 없이 갱신하고, 발급 문서는 언어별 이미지 재작업 없이 확장하는 구조 마련",
    ],
  },
  {
    slug: "cs-automation",
    company: "주식회사 데이원컴퍼니",
    name: "AI 기반 CS 상담 보조 시스템 구축",
    period: "2026.05 — 2026.07",
    tech: ["Spring AI", "Spring Boot", "Gemini", "Redis", "Pub/Sub"],
    relatedPosts: ["spring-ai-cs-automation"],
    tasks: [
      {
        content: "기존 PHP·n8n에 나뉜 답변 초안·태그 추천을 Spring AI 기반으로 통합하고, **상담원이 검수해 발송하는 업무 흐름 구축**",
      },
      {
        content: "첫 초안에 필요한 고객 정보를 백엔드에서 병렬 조회하고, **빠른 초안 생성과 FAQ·문서 검색 기반 QA를 분리**해 대기 시간 개선",
      },
      {
        content: "Pub/Sub 이벤트와 티켓별 Redis 락, 고객 입력별 식별자로 **중복 생성과 오래된 이벤트 처리를 방지**하고 추가 문의에는 새 초안 생성",
      },
      {
        content: "로그·트레이스·고객 이용 흐름을 조회하는 오류 진단과 출처·신뢰도 평가를 추가해, 상담원이 답변 근거와 추가 확인 항목을 함께 검토하도록 구성",
      },
    ],
    achievements: [
      "시스템 적용 이후 운영 데이터에서 **CS 처리량 약 43% 감소** 확인",
    ],
  },
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
    tech: ["Java", "Spring Boot", "Redis", "PortOne"],
    tasks: [
      {
        content: "**PHP 레거시 결제 시스템을 Java/Spring으로 이관**하고, 결제 검증·수강권 발급·실패 복구 흐름을 재설계",
      },
      {
        content: "PortOne의 결제 완료 알림(Webhook)을 받아 서버에서 결제 검증·저장·수강권 발급을 처리하고, 앱은 조회 API로 처리 결과를 확인하도록 역할 분리",
      },
      {
        content: "Redis 락으로 결제 요청의 동시 처리를 제어하고, 이미 처리된 결제인지 확인해 **중복 결제 0건** 달성",
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
    period: "2024.09 — 2026.04",
    tech: ["Java", "Spring Boot", "Spring OAuth2", "JWT", "JWKS", "GCP KMS", "Redis"],
    relatedPosts: ["auth-authorize-callback-flow", "auth-token-verification-migration", "jwt-hs256-to-rs256-jwks-kms"],
    tasks: [
      {
        content: "PHP 세션과 프론트엔드 토큰 발급에 흩어진 인증 책임을 Java/Spring 기반 인증 서버로 재정리",
      },
      {
        content: "JWT 기반 서버사이드 인증 구조로 전환하고 Refresh Token Rotation 적용",
      },
      {
        content: "JWT 서명 방식을 HS256에서 RS256/JWKS 기반 구조로 전환하고, GCP KMS 서명과 `kid` 기반 key rotation 흐름 설계",
        details: [
          "검증 서비스에는 공개키만 배포하고, 서명 권한은 인증 서버와 KMS 권한으로 제한",
          "기존 HS256 토큰을 일정 기간 허용하는 legacy decoder를 두어 무중단 전환 경로 마련",
          "JWKS cache TTL과 access token 만료 시간을 고려해 key rotation 순서 정리",
        ],
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
          "외부 로그인 후 서비스 자체 토큰으로 전환하는 인증 흐름 구성",
          "인증 제공자 추가를 고려한 확장 구조 마련",
          "서비스 자체 OAuth 인증으로 통합해 유지보수성과 운영 효율 개선",
        ],
      },
    ],
    achievements: [
      "프론트엔드·PHP에 흩어진 인증 책임을 Java/Spring 기반 인증 서버로 통합",
      "서명 권한과 검증 권한을 분리해 여러 서비스가 공개키 기반으로 토큰을 검증할 수 있는 구조 마련",
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
    period: "2025.10 — 2026.07",
    tech: ["AWS", "GCP", "Kubernetes", "ArgoCD", "Terraform", "Firestore", "Valkey", "OpenTelemetry"],
    relatedPosts: ["ecs-to-eks-migration", "aws-to-gcp-migration", "lgtm-stack-observability"],
    tasks: [
      {
        content: "**ECS→EKS 마이그레이션**으로 Kubernetes 기반 운영 환경을 구성하고, 빌드 결과를 ArgoCD 배포·완료 알림으로 연결하는 **GitOps 배포 체계 구축**",
      },
      {
        content: "**AWS→GCP 서비스 이관** 과정에서 백엔드·웹·알림 서비스를 GKE로 옮기고, 배포·캐시 연결·인증 설정을 새 환경에 맞게 전환",
      },
      {
        content: "**WAF로 웹 공격을 차단하고 Terraform으로 보안 규칙을 관리**하며, 인증 정보를 시크릿 관리 서비스로 분리해 코드에 저장하지 않도록 개선",
      },
      {
        content: "알림 서비스의 DynamoDB 의존을 저장소 인터페이스로 분리하고, **Firestore 어댑터와 데이터 이관 도구 구현**",
        details: [
          "기존 조회·조건부 갱신·예약 처리 동작을 보존하도록 설계하고 에뮬레이터 기반 회귀 테스트 작성",
          "백필·증분 동기화·이관 전 점검을 구현하고, 이관 실행 중 큐 소비·스케줄러를 중지해 실제 알림 발송과 분리",
        ],
      },
      {
        content: "Datadog 비용 부담을 줄이기 위해 **LGTM 관측 스택**을 구축하고, MDC·트레이스 ID로 로그·트레이스·메트릭을 함께 추적하는 환경 구성",
        details: [
          "GKE 실행 환경에 맞춰 JVM 메모리·리소스 설정과 로그·메트릭 수집 경로를 조정하며 이관 후 운영 안정화",
        ],
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
