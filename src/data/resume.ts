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

export interface ProjectDetail {
  slug: string
  company: string
  name: string
  period: string
  tech: string[]
  tasks: TaskItem[]
  achievements?: string[]
  relatedPosts?: string[]
}

export interface Certification {
  name: string
  year: string
}

export const PROFILE = {
  name: "윤혁준",
  github: "https://github.com/devy1540",
  email: "gurwns1540@gmail.com",
  introduction:
    "결제·구독·수업·인증 등 서비스 핵심 도메인을 End-to-End로 설계하고 운영해온 5년차 백엔드 엔지니어입니다.\n결제 시스템 전면 재설계, 멀티채널 알림서버 신규 구축, 도메인 모델 리팩토링 등 비즈니스 임팩트가 큰 프로젝트를 오너십 있게 이끌었습니다.\nOpenAI·Gemini·Bedrock 기반 LLM 파이프라인과 AI 코드리뷰 자동화를 프로덕션에 적용하며, AI를 제품과 개발 생산성 양쪽에 녹여내고 있습니다.",
}

export const SKILLS: Record<string, string[]> = {
  Backend: ["Java", "Spring Boot", "QueryDSL", "MyBatis", "JPA", "Kafka"],
  Infrastructure: ["AWS", "Kubernetes", "Docker", "ArgoCD", "Terraform", "Nginx"],
  Database: ["PostgreSQL", "Redis", "DynamoDB", "Apache Druid"],
  "AI / LLM": ["OpenAI", "Gemini", "AWS Bedrock"],
  Monitoring: ["Grafana", "Loki", "Tempo", "Prometheus"],
  Tools: ["Git", "GitHub Actions", "JMeter", "Notion"],
}

export const COMPANIES: Company[] = [
  {
    name: "주식회사 데이원컴퍼니",
    role: "Backend Engineer",
    period: "2024.08 — 현재",
    highlights: [
      "AI 파이프라인·알림서버 등 **신규 시스템 0→1 구축**",
      "결제·알림·인증 등 핵심 도메인 전면 재설계로 **CS 인입 평균 80~90% 감소**",
      "PHP 레거시 → Java/Spring 전면 이관, **PHP 서버 완전 제거**",
      "Facade 패턴·응답 공통화 등 개발 프로세스 정립으로 **팀 생산성 향상**",
      "ECS→EKS 마이그레이션, ArgoCD GitOps, LGTM 모니터링 등 **인프라 현대화**",
    ],
    projects: [
      { slug: "ai-diagnostic-pipeline", name: "AI 진단/피드백 파이프라인 구축", period: "2025.10 — 2026.01", summary: "7단계 AI 파이프라인 재설계, CS 98% 감소" },
      { slug: "payment-system", name: "결제 시스템 전면 재설계", period: "2025.03 — 2025.09", summary: "PHP→Java 전면 이관, 중복 결제 0건 달성" },
      { slug: "notification-server", name: "멀티채널 알림서버 신규 구축", period: "2025.06 — 2025.10", summary: "4채널 통합 독립 알림서버 0→1 구축, 중복 발송률 0%" },
      { slug: "personalization-system", name: "유저 데이터 기반 개인화 시스템 구축", period: "2025.01 — 2026.01", summary: "세그멘테이션 기반 차등 쿠폰·해지방어 시스템" },
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
        content: "HTTP 직접 호출 + 동기 단일 프롬프트로 처리하던 진단 프로세스를 **Spring AI** 기반 **7단계 AI 파이프라인**(STT 로드 → Semantic Chunking → STT 보정 → 지표 산출 → LLM 피드백 → 문제 생성 → 알림)으로 재설계",
        details: [
          "진단 품질 개선으로 **CS 인입 98% 감소**",
          "기존 java/spring 환경으로 통합할 수 있어서 유지보수 완화 / 개발 난이도 완화",
          "각 파이프라인 별로 비동기 처리하여 병목현상 최소화 및 성능 최적화",
        ],
      },
      {
        content: "Gemini·Amazon Bedrock·OpenAI에서 제공하는 여러 모델들을 스텝 특성에 맞게 배치하고, 백오피스에서 **무중단으로 모델·프롬프트 변경** 가능한 구조 설계",
        details: [
          "**LLM 비용 약 50% 절감**",
        ],
      },
      {
        content: "AI 할루시네이션 대응 Correction 스텝 추가 및 각 파이프라인 별 포맷검증 실패 시 재시도 기능 추가",
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
        content: "PHP로 구현된 레거시 결제 시스템을 Java/Spring으로 전면 이관. 원활한 개발을 위해 레거시인 portone v1 서비스를 v2로 점진적 마이그레이션을 진행 및 하위 호환성 유지하면서 전환 수행",
      },
      {
        content: "**1차 리팩토링으로 SQS 기반 이벤트 드리븐 아키텍처**로 전환 후 백엔드에서 결제 프로세스를 단계적으로 나누어 이벤트 기반 비동기 처리",
        details: [
          "사용자 이벤트 추적의 어려움, 트랜잭션 문제 등 다양한 문제를 직면",
        ],
      },
      {
        content: "**2차 리팩토링으로 SQS 사용 제거 및 API 방식으로 전환** 후 1차 리팩토링때 겪은 문제를 해소하여 결제 프로세스 안정화 확보",
      },
      {
        content: "Redis Lock 기반 멱등성 체크로 동시 결제 방어, Webhook + Polling 이중 검증으로 PG사 응답 지연 시에도 결제 상태 정합성 확보하여 **중복 결제 0건** 달성",
      },
      {
        content: "자동 환불·쿠폰 복구·보상권 복구 등 엣지케이스 방어 로직 설계하여 결제 관련 **CS 이슈 90% 감소**",
      },
      {
        content: "결제 흐름을 enum 기반 타입별 처리로 단일화하여 **신규 결제 수단 연동 공수 50% 이상 감소**",
      },
      {
        content: "구독 만료일에 대한 알고리즘 개발 및 unit 테스트로 검증",
        details: [
          "매월 말일에 보정업무 하던 작업을 완전 제거",
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
    tasks: [
      {
        content: "카카오톡·SMS·앱푸시·Slack 등 **N개 채널을 통합**하는 독립 알림서버를 0→1로 설계 및 구현. 기존 백엔드·PHP에 분산된 알림 로직을 **Java/Spring** 기반 신규 서비스로 구축 및 통합",
      },
      {
        content: "**SQS 기반 이벤트 드리븐 아키텍처로 구성**하여 알림이 과도하게 몰려도 안전하게 처리할 수 있고 DLQ 구성으로 알림 누락이 없도록 설계",
      },
      {
        content: "enum 기반 채널 라우팅 시스템 설계로 **신규 알림 추가 시 enum 1건 등록만으로 확장** 가능. 클라이언트 SDK 직접 개발하여 연동 표준화",
      },
      {
        content: "**Java Reflection** 으로 알림 메세지 변수와 객체의 변수가 일치하거나 어노테이션 기반 매핑인 경우 별도의 replace 없이 자동으로 메세지 치환할 수 있도록 SDK 구성",
      },
      {
        content: "알림 메시지를 관리할 수 있도록 백오피스에 기능, 메뉴 신설하여 서비스 중단 없이 관리",
      },
      {
        content: "Redis Lock 기반 멱등성 체크로 **중복 발송률 0%** 달성, 중복제거로 인한 카카오 알림 비용 **10% 절감**",
      },
      {
        content: "AWS DynamoDB를 이용하여 이력관리, 유저 별 예약알림 기능 구현하여 다양한 플레이를 할 수 있도록 구성",
      },
    ],
  },
  {
    slug: "personalization-system",
    company: "주식회사 데이원컴퍼니",
    name: "유저 데이터 기반 개인화 시스템 구축",
    period: "2025.01 — 2026.01",
    tech: ["Spring Boot", "Redis", "PostgreSQL", "AWS Lambda"],
    tasks: [
      {
        content: "수강 이력 기반 유저 세그멘테이션 엔진 구축 및 세그먼트별 차등 쿠폰 자동 발급",
        details: [
          "cron을 통해 자동발급되던 쿠폰을 이제 **세그먼트 별로 조건에 맞는 쿠폰이 자동 발급되어 다양한 마케팅 / 운영 플레이를 할 수 있도록 구성**",
        ],
      },
      {
        content: "사용자 별 보유한 쿠폰을 기준으로 최대 할인 자동 적용",
        details: [
          "사용자가 별도의 조작 없이 가격표 / 결제단에서 최대로 할인된 금액으로 보여지게 하여 **구매에 대한 진입장벽을 최소화**",
        ],
      },
      {
        content: "사용자 효능감 목적을 위한 수강증 발급 기능 추가",
        details: [
          "유저 요청에 따라 aws lambda로 PDF 생성 후 웹훅 기반으로 요청을받으면 서버에서 데이터 정제 및 적재 후 사용자에게 이메일 전송",
        ],
      },
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
        content: "PHP 세션 + 프론트엔드 토큰 발급 구조를 **JWT 기반 서버사이드 인증**으로 전면 재설계. Refresh Token Rotation 적용으로 토큰 탈취 피해 최소화",
      },
      {
        content: "PHP 레거시 전체 기능(인증·유저 관리·API 라우팅)을 Java로 마이그레이션 완료를 통해 PHP/Java 이중 운영 해소",
      },
      {
        content: "PHP 세션 문제로 타 유저 계정 정보가 노출되던 **보안 이슈 원천 해결**",
      },
      {
        content: "Spring Oauth2 등을 이용하여 인증 체계 확립",
        details: [
          "카카오 로그인 후 서비스 자체 토큰으로 롤링 후 인증 처리",
          "추후 Agenda인 Google Login 기능 추가를 위한 확장구조 마련",
          "서비스 자체 Oauth 인증을 구현하여 통합된 구조로 유지보수 및 효율성 대폭 증가",
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
    tasks: [
      {
        content: "전통적인 Spring MVC 패턴에 **Facade 패턴을 도입**하여 개발 규칙을 정립",
        details: [
          "Controller -> Facade(gateway) -> Service -> Repository로 개발 프로세스 정립",
          "**Service와 Repository는 도메인별 단일 책임 원칙을 준수할 수 있게 구성**하고 Facade layer에서 비즈니스 처리를 위해 여러 서비스를 하나로 합치는 프로세스 추가",
          "서비스 별 단일책임에 대해 보장성이 생겨 다른 기능 개발 시 같은 로직을 만들필요없이 **재사용 가능한 구조로 생산성 증가**",
        ],
      },
      {
        content: "응답처리 / 에러처리 구조 공통화",
        details: [
          "과거 200 응답안에 4xx, 5xx 담아내던 방식에서 http 응답코드를 활용할 수 있는 구조로 전면 개선",
          "모니터링 시스템에서 응답코드 별 사용자의 api 호출 추적이 편리하게 변경되어 빠른 대응 가능",
          "응답 / 에러 포맷을 공통화 하여 개발자 간 통신방식에 커뮤니케이션 비용 감소",
        ],
      },
      {
        content: "하드코딩된 상품 구조를 **메타 데이터 기반** 수강권 도메인으로 재설계 → 신규 상품(더블팩, 일본어 등) 출시 시 **코드 수정 없이 즉시 대응가능한 구조로 설계**",
      },
      {
        content: "레슨권 어드민 전면 고도화 (메타 조회·수정·복사, 엑셀 다운로드, 스케줄링 등) 및 공통 로직 통합 → 운영팀 **레슨권 관리 작업 시간 50% 이상 단축**",
      },
      {
        content: "KST로 되어있는 서비스를 UTC 시간대 전환하여 타임존 문제 해결 및 해외 사용자들에 대한 시차 문제 해결",
      },
    ],
  },
  {
    slug: "infra-modernization",
    company: "주식회사 데이원컴퍼니",
    name: "서비스 인프라 현대화 및 보안 체계 구축",
    period: "2025.10 — 2026.01",
    tech: ["Kubernetes", "ArgoCD", "Terraform", "Grafana", "Loki", "Tempo", "AWS WAF"],
    tasks: [
      {
        content: "ECS → EKS 마이그레이션 수행. kustomize + K8s Gateway API 기반 운영 환경 구성, **ArgoCD 기반 GitOps** 배포 파이프라인 구축 (PR 머지 → 빌드 → 배포 → Slack 알림 자동화)",
      },
      {
        content: "SQL Injection 등 웹 공격 탐지 후 **AWS WAF 도입** (Terraform으로 룰셋 코드화), Secrets Manager 전환 등 보안 체계 전면 강화하여 코드 상에 민감한정보가 없도록 변경",
      },
      {
        content: "datadog에 대한 비용 압박으로 인해 제거 후 **LGTM 모니터링 스택**(Grafana·Loki·Tempo·Mimir) 구축 후 서버의 기본적인 지표를 볼수있는 대시보드 추가",
      },
      {
        content: "MDC 기반 요청 추적 로그 도입 및 트레이스 아이디 별로 로그, 트레이스, 메트릭 전부 추적할 수 있는 환경 구성",
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
      { content: "MyBatis 이용 시 많은 파라미터 값으로 인해 쿼리 최대 크기에 걸리는 문제를 서브쿼리를 통해서 개선 및 성능 최적화" },
      { content: "N건의 쿼리 호출을 단일 쿼리 호출로 변경하여 성능을 개선" },
      { content: "데이터베이스 분석 도구 비즈니스 로직 구현" },
    ],
    achievements: [
      "대량의 데이터 조회에 있어서 성능 저하를 최소화하여 100ms에서 최대 3s 이내로 응답할 수 있도록 기능을 구현",
      "데이터베이스 상태와 분석을 할 수 있는 메트릭 데이터를 시각화하여 사용자가 사용할 수 있도록 기능을 구현",
    ],
  },
  {
    slug: "saas-monitoring",
    company: "주식회사 엑셈",
    name: "SaaS형 모니터링 서비스 비즈니스 로직 구현",
    period: "2021.09 — 2023.12",
    tech: ["Java", "Spring Boot", "Keycloak", "OpenAPI"],
    tasks: [
      { content: "사용자, 테넌트 등 메타 관리 기능 구현" },
      { content: "모니터링 서비스를 제공하는 기능 개발 및 사용자용 대시보드 작성 기능 개발" },
      { content: "OpenAPI를 통해 백엔드와 프론트의 공통된 코드 포맷 유지" },
      { content: "SLA 기능을 제공할 수 있는 서비스 개발" },
      { content: "품질관리를 위한 미들웨어 로그 분석기 기능 개발" },
      { content: "MSA 기반으로 분산된 서버에서 사용할 공통 코드에 대해서 라이브러리로 제작하여 관리 및 배포작업 진행" },
      { content: "배포된 라이브러리를 관리하기 위한 Nexus Repository 구축" },
    ],
    achievements: [
      "각 서비스 별로 모니터링 기능 구현하여 사용자에게 제공",
      "IAM 솔루션인 Keycloak을 이용하여 로그인 기능을 구현, 사용자가 SSO을 사용할 수 있도록 제공",
      "관리자가 테넌트를 생성하여 테넌트 별 사용자를 초대할 수 있도록 기능 개발",
      "API 명세서를 통해 포맷의 일관성을 유지하여 프론트와 협업 시 소통 개선 및 생산성 향상",
      "SaaS형 제품에 대한 상태를 볼 수 있는 SLA를 개발하여 분산된 서버의 상태를 실시간으로 확인할 수 있는 기능 제공",
      "미들웨어로 사용중인 드루이드에서 제공되는 로그를 수집하여 일일 리포트로 만들어 이메일로 발송할 수 있도록 기능 개발",
      "중복되는 코드 방지 및 팀 내 생산성 증가",
    ],
  },
  {
    slug: "data-pipeline",
    company: "주식회사 엑셈",
    name: "SaaS형 모니터링 서비스 데이터 수집 파이프라인 구축",
    period: "2021.01 — 2021.09",
    tech: ["Kafka Stream", "Apache Druid", "Spring Boot", "Kubernetes"],
    tasks: [
      { content: "Kafka Stream을 이용하여 Kafka로부터 수집된 데이터를 재가공하여 필요한 데이터를 생성" },
      { content: "Apache Druid를 사용하여 실시간으로 데이터를 수집하고 수집된 데이터를 바로 사용할 수 있도록 관리" },
      { content: "제한된 환경에서 Apache Druid의 성능을 최적화하기 위해 수집과 조회 부분을 나누어서 리팩토링 작업 진행" },
      { content: "부하에 따라서 서버의 메모리 점유율을 기반으로 쿠버네티스 기능을 활용하여 자동으로 scale in/out이 되어 무중단 서비스를 운영할 수 있도록 구성" },
    ],
    achievements: [
      "Kafka Stream 구현 시 Spring Boot으로 구현하여 유지보수의 용이성 증가",
      "필요한 데이터를 각 서버에서 로직으로 구현할 필요가 없어 불필요한 작업을 감소 및 생산성 증가",
      "공식 문서에서 권장하는 스펙보다 약 1/2가량 단축 후 초당 45,000건까지 성능저하 없이 유지",
      "데이터 유실과 중복을 최소화하여 정합성을 유지",
    ],
  },
  {
    slug: "k8s-monitoring",
    company: "주식회사 엑셈",
    name: "쿠버네티스 모니터링 시스템 개발",
    period: "2020.08 — 2021.01",
    tech: ["Java", "Spring Boot", "QueryDSL", "Prometheus", "JMeter"],
    tasks: [
      { content: "Prometheus Query 호출을 Multi Query 호출로 변경하여 N건의 호출을 1~3건 이내로 호출할 수 있도록 변경" },
      { content: "JPA Native Query에서 QueryDSL 도입으로 개선 작업 진행" },
      { content: "하드 코딩과 비효율적인 로직을 개선하기 위해 디자인 패턴 적용" },
      { content: "쿠버네티스 자원 조회하는 비즈니스 로직 구현" },
      { content: "JMeter를 통한 부하테스트 진행" },
    ],
    achievements: [
      "최대 90%까지 API 호출 개선",
      "빌더 패턴 도입으로 불필요한 하드코딩 및 가독성 개선",
      "QueryDSL 도입을 통해 컴파일 시점에서 에러를 확인할 수 있어 생산성을 향상",
      "사내 테스트 진행 시 약 50,000tps까지 성능저하 없도록 개선",
      "클라우드 모니터링 솔루션 CloudMOA 제품 출시",
    ],
  },
]
