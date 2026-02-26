import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/i18n"

interface ProjectDetail {
  slug: string
  company: string
  name: string
  period: string
  tech: string[]
  tasks: string[]
  achievements: string[]
}

const PROJECTS: ProjectDetail[] = [
  {
    slug: "ai-diagnostic-pipeline",
    company: "주식회사 데이원컴퍼니",
    name: "AI 진단/피드백 파이프라인 구축",
    period: "2025.10 — 2026.01",
    tech: ["Gemini", "Bedrock", "OpenAI", "Spring Boot"],
    tasks: [
      "단일 프롬프트로 처리하던 진단 프로세스를 5단계 AI 파이프라인(STT 파싱 → Semantic Chunking → LLM 피드백 → 다국어 번역 → 하이라이트)으로 재설계. Gemini·Bedrock·GPT 3종 모델을 스텝 특성에 맞게 배치하여 비용과 품질 최적화",
      "파이프라인 스텝별 LLM 모델·프롬프트를 백오피스에서 무중단 변경 가능하도록 설계하여, 비개발자도 품질 튜닝 가능한 구조 확보",
      "유저의 발화문 기반으로 정적분석 점수 영역 및 동일한 수업의 다른 사용자들 평균으로 유저의 만족도 개선",
      "AI 할루시네이션 대응 Correction 스텝 추가 및 자동 retry 및 fallback 구축으로 프로덕션 안정화 완료",
    ],
    achievements: [
      "진단 품질 개선으로 CS 인입 98% 감소 (기존 단일 프롬프트 대비)",
      "진단 리포트 생성 시간 6~10분 → 1~3분 (약 70% 단축)",
      "멀티모델 배치 및 프롬프트 최적화로 LLM 비용 약 50% 절감",
    ],
  },
  {
    slug: "notification-server",
    company: "주식회사 데이원컴퍼니",
    name: "멀티채널 알림서버 신규 구축",
    period: "2025.06 — 2025.10",
    tech: ["Spring Boot", "Redis", "DynamoDB", "Kafka"],
    tasks: [
      "카카오톡·SMS·앱푸시·Slack 4개 채널을 통합 및 신규채널에 확장가능한 구조로 독립 알림서버를 0→1로 설계 및 구현. 기존 백엔드·PHP 서버에 분산되어 있던 알림 로직을 단일 서비스로 통합",
      "expo를 이용한 앱푸시 서비스 신규 기능 추가 및 유저 별 멀티 디바이스로 동일한 app push가 나갈 수 있게 확장",
      "enum 기반 채널 라우팅 시스템 설계로 신규 알림 추가 시 enum 1건 등록만으로 확장 가능한 구조 확보. 클라이언트 SDK를 직접 개발하여 연동 표준화",
      "Redis Lock 기반 멱등성 체크로 중복 발송 방지, DynamoDB 기반 알림 이력·예약 알림 기능 구현",
    ],
    achievements: [
      "분산 발송 2곳 → 1곳으로 일원화, 알림 연동 코드를 SDK 호출로 단순화",
      "중복 발송률 0% 달성, 카카오 알림 비용 10% 절감",
      "장기 미접속자 케어 알림 등 6종 터치포인트 알림 자동화로 마케팅 플레이 즉시 가능",
    ],
  },
  {
    slug: "payment-system",
    company: "주식회사 데이원컴퍼니",
    name: "결제 시스템 재설계",
    period: "2025.03 — 2025.09",
    tech: ["Java", "Spring Boot", "Redis", "Portone"],
    tasks: [
      "PHP 레거시 결제 시스템을 Java로 전면 이관. Portone V1→V2 마이그레이션을 설계하고 하위 호환성을 유지하면서 단계적 전환 수행",
      "Redis Lock 기반 동시 결제 방어, Webhook + Polling 이중 검증으로 PG사 응답 지연 시에도 결제 상태 정합성 확보",
      "결제 흐름을 enum 기반 타입별 처리로 단일화하여 신규 결제 수단 확장이 용이한 구조로 재설계",
      "결제과정에서 서버측 문제 발생 시 자동 환불, 미납자 재결제 시 기존 쿠폰 자동 적용, 보상권(서비스 레슨) 자동 복구, 결제 실패 15회 초과 시 레슨권 상태 자동 전환, 무상 복구 시나리오 등 다양한 엣지케이스에 대한 방어 로직 설계 및 구현",
      "구독결제 시 만료일 오차로 인해 수동 보정작업이 있어 만료일 계산식 확립 후 알고리즘 개발",
    ],
    achievements: [
      "Redis Lock 도입 후 중복 결제 0건 달성",
      "결제 관련 CS 이슈 90% 감소, 결제 데이터 정합성 확보로 지표 신뢰도 향상",
      "결제 흐름 단일화로 신규 결제 수단 연동 공수 50% 이상 감소",
      "구독 만료일 계산 알고리즘 확립으로 수동 보정 업무 완전 제거",
    ],
  },
  {
    slug: "personalization-system",
    company: "주식회사 데이원컴퍼니",
    name: "유저 데이터 기반 개인화 시스템 구축",
    period: "2025.01 — 2026.01",
    tech: ["Spring Boot", "Redis", "PostgreSQL"],
    tasks: [
      "수강 이력 기반 유저 세그멘테이션 기능 구축",
      "세그먼트별 차등 쿠폰 자동 발급, 가격표 페이지 최대 할인 자동 적용, 최적 연장 레슨권 추천 알고리즘 개발",
      "체험유저의 경우 체험수업 후 효능성을 줄 수 있는 결과 리포트를 PDF로 전달하는 기능 추가",
      "기관 제출 및 개인의 성취감 목적달성을 위해 수강확인증 발급 기능 추가",
      "구독 해지방어 페이지 신규 개발: 유저 수강 이력 기반 최적 연장 상품 추천, 보유 쿠폰 중 최대 할인 자동 적용. 만료 예정/만료 후 쿠폰 자동발급 크론 2종으로 수동 운영 공수 제거",
      "백오피스에서 세그먼트 분류 기준·할인율·노출 조건을 무중단으로 관리할 수 있는 셀프서비스 환경 구현",
    ],
    achievements: [
      "단발성 이벤트나 마케팅 이벤트 등 다양한 프로모션을 백오피스를 통해 병목현상없이 셀프서비스로 진행",
      "세그먼트별 차등 할인 적용으로 동일 프로모션 예산 대비 이탈 유저 재전환율 10% 이상 증가",
      "해지방어 페이지 도입 및 쿠폰 자동화로 구독 이탈률 감소에 기여",
    ],
  },
  {
    slug: "lesson-domain",
    company: "주식회사 데이원컴퍼니",
    name: "수업·수강권 도메인 설계 및 고도화",
    period: "2024.09 — 2026.02",
    tech: ["Java", "Spring Boot", "JPA", "PostgreSQL"],
    tasks: [
      "하드코딩된 상품 구조를 메타 데이터 기반 수강권 도메인으로 재설계. 언어·회차·수업시간(15/25분)을 유연하게 조합 가능한 구조로 전환하여 신규 상품 추가 시 코드 수정 불필요",
      "레슨권 어드민 전면 고도화 (메타 조회·수정·복사, 엑셀 다운로드, 스케줄링 등) 및 레슨권 생성·발급 공통 로직 통합으로 정합성 강화",
    ],
    achievements: [
      "신규 상품(더블팩, 일본어 등) 출시 시 코드 수정 없이 즉시 대응 가능한 구조 확보",
      "어드민 고도화로 운영팀 레슨권 관리 작업 시간 50% 이상 단축",
      "체험 → 정규 전환 플로우 체계화로 체험레슨 완료율 향상에 기여",
    ],
  },
  {
    slug: "auth-refactoring",
    company: "주식회사 데이원컴퍼니",
    name: "인증 시스템 리팩토링 및 레거시 전환",
    period: "2024.09 — 2025.05",
    tech: ["Java", "Spring Boot", "JWT", "Redis"],
    tasks: [
      "PHP 세션 + 프론트엔드 토큰 발급 구조를 JWT 기반 서버사이드 인증으로 전면 재설계. Refresh Token Rotation 적용으로 토큰 탈취 피해 최소화",
      "PHP 레거시 전체 기능(인증·유저 관리·API 라우팅)을 Java로 마이그레이션 완료",
      "마케팅 캠페인용 매직 링크(일회성 로그인) 기능 설계 및 구현",
    ],
    achievements: [
      "PHP/Java 이중 운영 → Java 단일 구조로 통합, 운영 복잡도 해소",
      "PHP 세션 문제로 타 유저 계정 정보가 노출되던 보안 이슈를 원천 해결",
      "로그인 로직 백엔드 이관으로 토큰 관리 보안 강화",
    ],
  },
  {
    slug: "infra-modernization",
    company: "주식회사 데이원컴퍼니",
    name: "서비스 인프라 현대화 및 보안 체계 구축",
    period: "2025.10 — 2026.01",
    tech: ["Kubernetes", "ArgoCD", "Terraform", "Grafana", "AWS WAF"],
    tasks: [
      "ECS → EKS 마이그레이션 수행. kustomize + K8s Gateway API + AWS Application Controller 기반으로 운영 환경 구성, ArgoCD 기반 GitOps 배포 파이프라인 구축 (PR 머지 → 빌드 → 배포 → Slack 알림 자동화)",
      "DDoS 해킹 시도 탐지 후 AWS WAF 도입 (Terraform으로 룰셋 코드화), Secrets Manager 전환, Actuator 경로 변경 등 보안 체계 전면 강화",
      "KST → UTC 시간대 전환, LGTM(Grafana·Loki·Tempo·Mimir) 모니터링 스택 구축, MDC 기반 요청 추적 로그 도입",
      "AI 코드리뷰 시스템, 정적 코드 분석기 등 품질관리를 위한 다양한 기능 추가",
    ],
    achievements: [
      "WAF 도입 후 보안 관련 CS 및 해킹 시도 0건에 수렴",
      "ArgoCD 도입으로 배포 자동화 및 승인 기반 안전 배포 체계 구축, Slack에서 즉시 롤백 가능",
      "KST→UTC 전환으로 일본어 서비스 등 글로벌 확장 기반 확보",
    ],
  },
  {
    slug: "dpm-monitoring",
    company: "주식회사 엑셈",
    name: "온프레미스형 DPM 모니터링 시스템 리팩토링",
    period: "2024.01 — 2024.05",
    tech: ["Java", "Spring Boot", "MyBatis", "PostgreSQL"],
    tasks: [
      "MyBatis 이용 시 많은 파라미터 값으로 인해 쿼리 최대 크기에 걸리는 문제를 서브쿼리를 통해서 개선 및 성능 최적화",
      "N건의 쿼리 호출을 단일 쿼리 호출로 변경하여 성능을 개선",
      "데이터베이스 분석 도구 비즈니스 로직 구현",
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
      "사용자, 테넌트 등 메타 관리 기능 구현",
      "모니터링 서비스를 제공하는 기능 개발 및 사용자용 대시보드 작성 기능 개발",
      "OpenAPI를 통해 백엔드와 프론트의 공통된 코드 포맷 유지",
      "SLA 기능을 제공할 수 있는 서비스 개발",
      "품질관리를 위한 미들웨어 로그 분석기 기능 개발",
      "MSA 기반으로 분산된 서버에서 사용할 공통 코드에 대해서 라이브러리로 제작하여 관리 및 배포작업 진행",
      "배포된 라이브러리를 관리하기 위한 Nexus Repository 구축",
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
      "Kafka Stream을 이용하여 Kafka로부터 수집된 데이터를 재가공하여 필요한 데이터를 생성",
      "Apache Druid를 사용하여 실시간으로 데이터를 수집하고 수집된 데이터를 바로 사용할 수 있도록 관리",
      "제한된 환경에서 Apache Druid의 성능을 최적화하기 위해 수집과 조회 부분을 나누어서 리팩토링 작업 진행",
      "부하에 따라서 서버의 메모리 점유율을 기반으로 쿠버네티스 기능을 활용하여 자동으로 scale in/out이 되어 무중단 서비스를 운영할 수 있도록 구성",
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
      "Prometheus Query 호출을 Multi Query 호출로 변경하여 N건의 호출을 1~3건 이내로 호출할 수 있도록 변경",
      "JPA Native Query에서 QueryDSL 도입으로 개선 작업 진행",
      "하드 코딩과 비효율적인 로직을 개선하기 위해 디자인 패턴 적용",
      "쿠버네티스 자원 조회하는 비즈니스 로직 구현",
      "JMeter를 통한 부하테스트 진행",
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

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = PROJECTS.find((p) => p.slug === slug)
  const t = useT()

  useMetaTags({
    title: project?.name,
    description: project ? `${project.company} — ${project.name}` : undefined,
    url: slug ? `/about/projects/${slug}` : undefined,
  })

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t.post.notFound}</h1>
        <Button asChild variant="ghost">
          <Link to="/about" viewTransition>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.about.backToAbout}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
        <Link to="/about" viewTransition>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.about.backToAbout}
        </Link>
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {project.name}
        </h1>
        <p className="text-muted-foreground">
          {project.company} · {project.period}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tech.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      </header>

      <Separator className="my-6" />

      <section>
        <h2 className="text-xl font-semibold mb-4">{t.about.tasks}</h2>
        <ul className="space-y-3">
          {project.tasks.map((task, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">-</span>
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-6" />

      <section>
        <h2 className="text-xl font-semibold mb-4">{t.about.achievements}</h2>
        <ul className="space-y-3">
          {project.achievements.map((achievement, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">-</span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
