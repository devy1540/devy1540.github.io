import type { ReactNode } from "react"
import { useMetaTags } from "@/hooks/useMetaTags"
import { useLanguage } from "@/i18n"
import type { Language } from "@/i18n"
import { localizePath } from "@/lib/i18n-routing"
import { getResumeData } from "@/data/resume-i18n"

const EFFECTIVE_DATE = "2026-06-29"

interface PrivacySection {
  heading: string
  paragraphs: string[]
}

interface PrivacyContent {
  effectiveLabel: string
  intro: string
  sections: PrivacySection[]
}

// linkify: 본문 문자열의 URL/이메일만 클릭 가능한 링크로 변환 (데이터는 순수 문자열로 유지)
function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.\w+)/g).map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-all">
          {part}
        </a>
      )
    }
    if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="text-primary underline underline-offset-2 break-all">
          {part}
        </a>
      )
    }
    return part
  })
}

function getContent(language: Language, email: string): PrivacyContent {
  if (language === "en") {
    return {
      effectiveLabel: `Effective date: ${EFFECTIVE_DATE}`,
      intro:
        "This Privacy Policy explains what information is collected and how it is processed when you use the services provided at devy1540.dev (the “Site”).",
      sections: [
        {
          heading: "1. Information we collect",
          paragraphs: [
            "The Site does not provide sign-up or login features and does not directly collect information that personally identifies you, such as your name or phone number.",
            "However, the following information may be collected automatically while you use the Site: browser type and settings, device information, operating system, IP address, visit date and time, pages viewed and time spent, and referring URL. This information is collected through cookies and similar technologies.",
          ],
        },
        {
          heading: "2. How we use information",
          paragraphs: [
            "Collected information is used only for the following purposes: analyzing site usage and improving content, serving and measuring advertisements, and maintaining service stability.",
          ],
        },
        {
          heading: "3. Advertising (Google AdSense)",
          paragraphs: [
            "The Site displays advertisements through Google AdSense.",
            "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this Site and other websites.",
            "Google's use of advertising cookies (such as the DART cookie) enables it to serve ads based on your visits to this Site and other sites on the internet.",
            "You may opt out of personalized advertising by visiting Google Ads Settings at https://www.google.com/settings/ads. You may also opt out of third-party vendors' use of cookies for personalized advertising at https://www.aboutads.info.",
          ],
        },
        {
          heading: "4. Web analytics (Google Analytics)",
          paragraphs: [
            "The Site uses Google Analytics to analyze visit statistics. Google Analytics collects site usage information anonymously through cookies and does not use it to identify individuals.",
            "To opt out of Google Analytics, you can install the Google Analytics Opt-out Browser Add-on at https://tools.google.com/dlpage/gaoptout.",
          ],
        },
        {
          heading: "5. Comments (Giscus)",
          paragraphs: [
            "Comments on the Site are provided through Giscus, which is based on GitHub Discussions. When you write a comment you sign in with a GitHub account, and your comment content and GitHub profile information are processed in accordance with GitHub's privacy policy.",
          ],
        },
        {
          heading: "6. Managing and refusing cookies",
          paragraphs: [
            "You can refuse or delete stored cookies through your web browser settings. Note that refusing cookies may limit the use of some features.",
            "For how to manage cookies in your browser, please refer to the help documentation for each browser.",
          ],
        },
        {
          heading: "7. Data retention and third-party processing",
          paragraphs: [
            "Automatically collected information is retained and processed according to the policies of the analytics and advertising providers above (such as Google). The Site does not store personal information in any separate database.",
          ],
        },
        {
          heading: "8. Changes to this policy",
          paragraphs: [
            "This policy may be amended in response to changes in laws or services, and any changes will be announced on this page.",
          ],
        },
        {
          heading: "9. Contact",
          paragraphs: [`For inquiries about the processing of personal information, please contact: ${email}`],
        },
      ],
    }
  }

  return {
    effectiveLabel: "시행일: 2026년 6월 29일",
    intro:
      "본 개인정보처리방침은 Devy(이하 ‘본 블로그’)가 devy1540.dev에서 제공하는 서비스 이용과 관련하여 수집하는 정보와 그 처리 방침을 안내합니다.",
    sections: [
      {
        heading: "1. 수집하는 정보",
        paragraphs: [
          "본 블로그는 회원가입이나 로그인 기능을 제공하지 않으며, 이름·연락처 등 개인을 직접 식별하는 정보를 직접 수집하지 않습니다.",
          "다만 서비스 이용 과정에서 다음 정보가 자동으로 수집될 수 있습니다: 브라우저 종류 및 설정, 기기 정보, 운영체제, IP 주소, 방문 일시, 방문한 페이지 및 체류 시간, 유입 경로(리퍼러). 이 정보는 쿠키 및 유사 기술을 통해 수집됩니다.",
        ],
      },
      {
        heading: "2. 정보의 이용 목적",
        paragraphs: [
          "수집된 정보는 다음 목적으로만 이용됩니다: 사이트 이용 통계 분석 및 콘텐츠 개선, 광고 게재 및 성과 측정, 서비스 안정성 유지.",
        ],
      },
      {
        heading: "3. 광고 (Google AdSense)",
        paragraphs: [
          "본 블로그는 Google AdSense를 통해 광고를 게재합니다.",
          "Google을 포함한 제3자 광고 공급업체는 쿠키를 사용하여 이용자의 본 사이트 및 다른 웹사이트 방문 기록을 바탕으로 맞춤형 광고를 게재합니다.",
          "Google이 광고 쿠키(DART 쿠키 등)를 사용함으로써, 이용자가 본 사이트와 인터넷상의 다른 사이트를 방문한 기록에 근거하여 광고가 게재됩니다.",
          "이용자는 Google 광고 설정(https://www.google.com/settings/ads)에서 맞춤형 광고를 사용 중지할 수 있습니다. 또한 https://www.aboutads.info 페이지에서 제3자 광고 공급업체의 쿠키 사용을 거부할 수 있습니다.",
        ],
      },
      {
        heading: "4. 웹 분석 (Google Analytics)",
        paragraphs: [
          "본 블로그는 방문 통계 분석을 위해 Google Analytics를 사용합니다. Google Analytics는 쿠키를 통해 이용자의 사이트 이용 정보를 익명으로 수집하며, 이는 개인을 식별하는 데 사용되지 않습니다.",
          "Google Analytics 수집을 거부하려면 Google Analytics 차단 브라우저 부가기능(https://tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다.",
        ],
      },
      {
        heading: "5. 댓글 (Giscus)",
        paragraphs: [
          "본 블로그의 댓글 기능은 Giscus(GitHub Discussions 기반)를 통해 제공됩니다. 댓글 작성 시 GitHub 계정으로 로그인하며, 댓글 내용과 GitHub 사용자 정보는 GitHub의 개인정보처리방침에 따라 처리됩니다.",
        ],
      },
      {
        heading: "6. 쿠키 관리 및 거부",
        paragraphs: [
          "이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. 다만 쿠키 저장을 거부할 경우 일부 기능 이용에 제한이 있을 수 있습니다.",
          "브라우저별 쿠키 설정 방법은 각 브라우저의 도움말을 참고하시기 바랍니다.",
        ],
      },
      {
        heading: "7. 정보의 보관 및 제3자 처리",
        paragraphs: [
          "자동으로 수집된 정보는 위 분석·광고 서비스 제공업체(Google 등)의 정책에 따라 보관·처리되며, 본 블로그는 별도의 데이터베이스에 개인정보를 저장하지 않습니다.",
        ],
      },
      {
        heading: "8. 개인정보처리방침의 변경",
        paragraphs: [
          "본 방침은 법령·서비스 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 고지합니다.",
        ],
      },
      {
        heading: "9. 문의",
        paragraphs: [`개인정보 처리에 관한 문의는 다음 연락처로 해주시기 바랍니다: ${email}`],
      },
    ],
  }
}

export function PrivacyPage() {
  const { language, t } = useLanguage()
  const email = getResumeData(language).profile.email
  const content = getContent(language, email)

  useMetaTags({
    title: t.common.privacy,
    description: language === "en" ? "Privacy policy for devy1540.dev." : "devy1540.dev의 개인정보처리방침입니다.",
    url: localizePath("/privacy", language),
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-1">{t.common.privacy}</h1>
      <p className="text-sm text-muted-foreground mb-8">{content.effectiveLabel}</p>
      <p className="mb-8 text-muted-foreground leading-relaxed">{content.intro}</p>
      {content.sections.map((section) => (
        <section key={section.heading} className="mb-6">
          <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-2 text-muted-foreground leading-relaxed">
              {linkify(paragraph)}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}
