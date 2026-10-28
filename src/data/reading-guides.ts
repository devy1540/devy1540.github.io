import type { Language } from "@/i18n"

interface ReadingGuide {
  id: string
  title: Record<Language, string>
  description: Record<Language, string>
  slugs: string[]
}

export const READING_GUIDES: ReadingGuide[] = [
  {
    id: "authentication",
    title: { ko: "로그인과 토큰 검증", en: "Login and token verification" },
    description: { ko: "로그인 책임을 백엔드로 옮기는 과정부터 JWT 서명과 키 배포까지.", en: "From moving login ownership to the backend to JWT signing and key distribution." },
    slugs: ["backend-owned-login-flow", "jwt-hs256-to-rs256-jwks-kms"],
  },
  {
    id: "payments",
    title: { ko: "결제 시스템 전환", en: "Payment system migration" },
    description: { ko: "PHP 결제를 Spring으로 이관하고 승인 결과를 동기 API로 연결한 기록.", en: "Migrating PHP payments to Spring and returning approval results through a synchronous API." },
    slugs: ["payment-system-migration-php-to-spring", "payment-system-redesign-sync-api"],
  },
  {
    id: "deployment",
    title: { ko: "Kubernetes와 배포 자동화", en: "Kubernetes and deployment automation" },
    description: { ko: "ECS에서 EKS로 옮긴 이유와 GitOps·Slack 승인 배포를 구성한 과정.", en: "Why the service moved from ECS to EKS and how GitOps deployments gained a Slack approval gate." },
    slugs: ["ecs-to-eks-migration", "gitops-argocd-n8n-deployment"],
  },
  {
    id: "runtime",
    title: { ko: "Java 업그레이드와 동시성", en: "Java upgrades and concurrency" },
    description: { ko: "JDK·Spring Boot 호환성 문제와 동기·가상 스레드·코루틴의 비교.", en: "JDK and Spring Boot compatibility, followed by synchronous, virtual-thread, and coroutine comparisons." },
    slugs: ["jdk-migration-strategy-11-to-25", "sync-virtual-coroutine-benchmark"],
  },
  {
    id: "internationalization",
    title: { ko: "다국어 전환과 롤백", en: "Internationalization and rollback" },
    description: { ko: "로케일의 우선순위를 정하고 기능 플래그로 다국어 적용 범위를 제어하기.", en: "Defining locale precedence and controlling internationalization with a feature flag." },
    slugs: ["i18n-01-foundation", "i18n-03-rollout-killswitch"],
  },
  {
    id: "applied-ai",
    title: { ko: "서비스에 AI 붙이기", en: "Putting AI into a service" },
    description: { ko: "Spring AI 파이프라인과 CS 자동화에서 모델 호출을 운영 흐름에 연결한 경험.", en: "Connecting model calls to operational workflows through Spring AI pipelines and customer-support automation." },
    slugs: ["spring-ai-pipeline-real-world", "spring-ai-cs-automation"],
  },
]
