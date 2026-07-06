import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  type Styles,
} from "@react-pdf/renderer"
import {
  PROFILE,
  SKILLS,
  COMPANIES,
  CERTIFICATIONS,
  PROJECTS,
  type Company,
} from "@/data/resume"

Font.register({
  family: "Pretendard",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Regular.otf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Medium.otf", fontWeight: 500 },
    { src: "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-SemiBold.otf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Bold.otf", fontWeight: 700 },
  ],
})

const colors = {
  primary: "#18181b",
  secondary: "#3f3f46",
  muted: "#71717a",
  faint: "#a1a1aa",
  accent: "#2563eb",
  border: "#e4e4e7",
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9,
    color: colors.primary,
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 42,
    lineHeight: 1.5,
  },
  // Header
  header: { marginBottom: 24 },
  name: { fontSize: 23, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.25, marginBottom: 9 },
  role: { fontSize: 8.5, fontWeight: 500, letterSpacing: 1.8, textTransform: "uppercase", color: colors.muted, marginBottom: 13 },
  contactRow: { flexDirection: "row", gap: 8 },
  contactLink: { fontSize: 8.5, color: colors.secondary, textDecoration: "none" },
  contactText: { fontSize: 8.5, color: colors.secondary },
  contactSep: { fontSize: 8.5, color: colors.faint },
  intro: { fontSize: 9, color: colors.secondary, lineHeight: 1.7, marginTop: 15 },
  // Section
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: 26,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Skills
  skillRow: { flexDirection: "row", marginBottom: 6 },
  skillCategory: { width: 92, fontSize: 8.5, fontWeight: 600, color: colors.primary },
  skillList: { flex: 1, fontSize: 8.5, color: colors.secondary },
  // Company
  companyOuterFirst: { marginTop: 6 },
  companyOuter: { marginTop: 18 },
  companyIntro: {},
  companyIntroDivided: { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  companyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 },
  companyName: { fontSize: 13, fontWeight: 700, letterSpacing: -0.2 },
  companyPeriod: { fontSize: 8.5, color: colors.muted },
  companyRole: { fontSize: 9, color: colors.muted, marginBottom: 12 },
  // Project
  projectBox: { marginBottom: 14 },
  projectName: { fontSize: 10, fontWeight: 600, color: colors.primary, marginBottom: 3 },
  techInline: { fontSize: 8, color: colors.muted, letterSpacing: 0.2, marginBottom: 8 },
  // Task
  taskGroup: { marginBottom: 5 },
  taskRow: { flexDirection: "row", paddingLeft: 2 },
  taskBullet: { width: 9, fontSize: 8.5, color: colors.faint, lineHeight: 1.6 },
  taskItem: { flex: 1, fontSize: 8.5, color: colors.secondary, lineHeight: 1.6 },
  detailRow: { flexDirection: "row", paddingLeft: 16, marginTop: 2 },
  detailArrow: { width: 12, fontSize: 8, color: colors.faint, lineHeight: 1.6 },
  detailItem: { flex: 1, fontSize: 8, color: colors.muted, lineHeight: 1.6 },
  // Achievement (small blue dot marker + emphasized metric)
  achGroup: { marginTop: 7 },
  achRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 2 },
  achDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.accent, marginTop: 4, marginRight: 8 },
  achText: { flex: 1, fontSize: 8.5, color: colors.primary, lineHeight: 1.55 },
  // Certifications
  certRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  certName: { fontSize: 9, color: colors.secondary },
  certYear: { fontSize: 8.5, color: colors.muted },
  boldText: { fontWeight: 700 },
  // URLs
  urlRow: { flexDirection: "row", marginBottom: 5 },
  urlLabel: { width: 110, fontSize: 8.5, fontWeight: 600, color: colors.primary },
})

/** Parse **bold** markdown into Text elements */
function BoldText({ style, children }: { style: Styles[string]; children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/)
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <Text key={i} style={s.boldText}>{part.slice(2, -2)}</Text>
        ) : (
          part
        ),
      )}
    </Text>
  )
}

function CompanySection({ company, isFirst }: { company: Company; isFirst: boolean }) {
  const companyProjects = company.projects
    .map((ps) => PROJECTS.find((p) => p.slug === ps.slug))
    .filter(Boolean)

  return (
    <View style={isFirst ? s.companyOuterFirst : s.companyOuter}>
      <View wrap={false} minPresenceAhead={80} style={isFirst ? s.companyIntro : s.companyIntroDivided}>
        <View style={s.companyHeader}>
          <Text style={s.companyName}>{company.name}</Text>
          <Text style={s.companyPeriod}>{company.period}</Text>
        </View>
        <Text style={s.companyRole}>{company.role}</Text>
      </View>

      {companyProjects.map((project) => (
        <View key={project!.slug} style={s.projectBox}>
          <View wrap={false} minPresenceAhead={50}>
            <Text style={s.projectName}>{project!.name}</Text>
            <Text style={s.techInline}>{project!.tech.join("   ·   ")}</Text>
          </View>
          {project!.tasks.map((task, i) => (
            <View key={i} style={s.taskGroup} wrap={false}>
              <View style={s.taskRow}>
                <Text style={s.taskBullet}>·</Text>
                <BoldText style={s.taskItem}>{task.content}</BoldText>
              </View>
              {task.details?.map((detail, j) => (
                <View key={j} style={s.detailRow}>
                  <Text style={s.detailArrow}>→</Text>
                  <BoldText style={s.detailItem}>{detail}</BoldText>
                </View>
              ))}
            </View>
          ))}
          {project!.achievements && project!.achievements.length > 0 && (
            <View style={s.achGroup}>
              {project!.achievements.map((ach, i) => (
                <View key={`ach-${i}`} style={s.achRow} wrap={false}>
                  <View style={s.achDot} />
                  <BoldText style={s.achText}>{ach}</BoldText>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

export function ResumePdfDocument() {
  return (
    <Document title={`${PROFILE.name} - Resume`} author={PROFILE.name}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{PROFILE.name}</Text>
          <Text style={s.role}>Backend Engineer</Text>
          <View style={s.contactRow}>
            <Link src={`mailto:${PROFILE.email}`} style={s.contactLink}>{PROFILE.email}</Link>
            <Text style={s.contactSep}>·</Text>
            <Text style={s.contactText}>{PROFILE.phone}</Text>
          </View>
          <Text style={s.intro}>{PROFILE.introduction}</Text>
        </View>

        {/* Experience */}
        <Text style={s.sectionTitle}>Experience</Text>
        {COMPANIES.map((company, idx) => (
          <CompanySection key={company.name} company={company} isFirst={idx === 0} />
        ))}

        {/* Skills */}
        <Text style={s.sectionTitle}>Skills</Text>
        {Object.entries(SKILLS).map(([category, skills]) => (
          <View key={category} style={s.skillRow}>
            <Text style={s.skillCategory}>{category}</Text>
            <Text style={s.skillList}>{skills.join(", ")}</Text>
          </View>
        ))}

        {/* Certifications */}
        <Text style={s.sectionTitle}>Certifications</Text>
        {CERTIFICATIONS.map((cert) => (
          <View key={cert.name} style={s.certRow}>
            <Text style={s.certName}>{cert.name}</Text>
            <Text style={s.certYear}>{cert.year}</Text>
          </View>
        ))}

        {/* URLs */}
        <Text style={s.sectionTitle}>URLs</Text>
        <View style={s.urlRow}>
          <Text style={s.urlLabel}>GitHub</Text>
          <Link src={PROFILE.github} style={s.contactLink}>{PROFILE.github}</Link>
        </View>
        <View style={s.urlRow}>
          <Text style={s.urlLabel}>LinkedIn</Text>
          <Link src={PROFILE.linkedin} style={s.contactLink}>linkedin.com/in/혁준-윤</Link>
        </View>
        <View style={s.urlRow}>
          <Text style={s.urlLabel}>Blog</Text>
          <Link src="https://devy1540.dev" style={s.contactLink}>https://devy1540.dev</Link>
        </View>
        {PROJECTS.flatMap((p) => p.relatedLinks ?? []).map((link) => (
          <View key={link.url} style={s.urlRow}>
            <Text style={s.urlLabel}>{link.title}</Text>
            <Link src={link.url} style={s.contactLink}>{link.url}</Link>
          </View>
        ))}
      </Page>
    </Document>
  )
}
