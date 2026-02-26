import { Github, Mail, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useMetaTags } from "@/hooks/useMetaTags"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const SKILLS = {
  Backend: ["Java", "Spring Boot", "QueryDSL", "MyBatis", "JPA", "Kafka"],
  Infrastructure: ["AWS", "Kubernetes", "Docker", "ArgoCD", "Terraform", "Nginx"],
  Database: ["PostgreSQL", "Redis", "DynamoDB", "Apache Druid"],
  "AI / LLM": ["OpenAI", "Gemini", "AWS Bedrock"],
  Monitoring: ["Grafana", "Loki", "Tempo", "Prometheus"],
  Tools: ["Git", "GitHub Actions", "JMeter", "Notion"],
}

const COMPANIES = [
  {
    name: "주식회사 데이원컴퍼니",
    role: "Backend Engineer",
    period: "2024.08 — 현재",
    projects: [
      { slug: "ai-diagnostic-pipeline", name: "AI 진단/피드백 파이프라인 구축", period: "2025.10 — 2026.01", summary: "5단계 AI 파이프라인 재설계, CS 98% 감소" },
      { slug: "notification-server", name: "멀티채널 알림서버 신규 구축", period: "2025.06 — 2025.10", summary: "4채널 통합 독립 알림서버 0→1 구축, 중복 발송률 0%" },
      { slug: "payment-system", name: "결제 시스템 재설계", period: "2025.03 — 2025.09", summary: "PHP→Java 전면 이관, 중복 결제 0건 달성" },
      { slug: "personalization-system", name: "유저 데이터 기반 개인화 시스템 구축", period: "2025.01 — 2026.01", summary: "세그멘테이션 기반 차등 쿠폰·해지방어 시스템" },
      { slug: "lesson-domain", name: "수업·수강권 도메인 설계 및 고도화", period: "2024.09 — 2026.02", summary: "메타 데이터 기반 유연한 상품 구조로 재설계" },
      { slug: "auth-refactoring", name: "인증 시스템 리팩토링 및 레거시 전환", period: "2024.09 — 2025.05", summary: "PHP 세션→JWT 기반 인증 전면 재설계" },
      { slug: "infra-modernization", name: "서비스 인프라 현대화 및 보안 체계 구축", period: "2025.10 — 2026.01", summary: "ECS→EKS 마이그레이션, WAF·GitOps 구축" },
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

const CERTIFICATIONS = [
  { name: "AWS Certified Developer - Associate", year: "2023" },
  { name: "CKA (Certified Kubernetes Administrator)", year: "2022" },
  { name: "SQLD", year: "2022" },
  { name: "정보처리기사", year: "2019" },
]

export function AboutPage() {
  const t = useT()
  useMetaTags({ title: "About", description: t.about.description, url: "/about" })

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="https://github.com/devy1540.png" alt="윤혁준" />
          <AvatarFallback className="text-2xl">HJ</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">윤혁준</h1>
          <p className="text-lg text-muted-foreground">{t.about.description}</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <Button asChild variant="outline" size="sm">
              <a
                href="https://github.com/devy1540"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="mailto:gurwns1540@gmail.com">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Introduction */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.introduction}</h2>
        <p className="text-muted-foreground leading-relaxed">
          결제·구독·수업·인증 등 서비스 핵심 도메인을 End-to-End로 설계하고
          운영해온 5년차 백엔드 엔지니어입니다. 결제 시스템 전면 재설계,
          멀티채널 알림서버 신규 구축, 도메인 모델 리팩토링 등 비즈니스
          임팩트가 큰 프로젝트를 오너십 있게 이끌었습니다. OpenAI·Gemini·Bedrock
          기반 LLM 파이프라인과 AI 코드리뷰 자동화를 프로덕션에 적용하며, AI를
          제품과 개발 생산성 양쪽에 녹여내고 있습니다.
        </p>
      </section>

      <Separator />

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.skills}</h2>
        <div className="space-y-4">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <Badge key={cert.name} variant="outline">
                  {cert.name} ({cert.year})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Experience + Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.experience}</h2>
        <div className="space-y-8">
          {COMPANIES.map((company) => (
            <div key={company.name} className="relative pl-6 border-l-2 border-muted">
              <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-sm text-muted-foreground">
                {company.role} · {company.period}
              </p>
              <div className="mt-4 space-y-2">
                {company.projects.map((project) => (
                  <Link
                    key={project.slug}
                    to={`/about/projects/${project.slug}`}
                    viewTransition
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.period}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {project.summary}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Contact */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.about.contact}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline">
            <a href="mailto:gurwns1540@gmail.com">
              <Mail className="mr-2 h-4 w-4" />
              gurwns1540@gmail.com
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://github.com/devy1540"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              github.com/devy1540
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
