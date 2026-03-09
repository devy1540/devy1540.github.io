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
  accent: "#2563eb",
  border: "#e4e4e7",
  bgLight: "#f4f4f5",
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9,
    color: colors.primary,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  // Header
  header: { marginBottom: 20 },
  name: { fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 },
  role: { fontSize: 11, color: colors.muted, marginBottom: 8 },
  contactRow: { flexDirection: "row", gap: 12 },
  contactLink: { fontSize: 8.5, color: colors.accent, textDecoration: "none" },
  intro: { fontSize: 9, color: colors.secondary, lineHeight: 1.6, marginTop: 12 },
  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
  },
  // Skills
  skillRow: { flexDirection: "row", marginBottom: 4 },
  skillCategory: { width: 80, fontSize: 8.5, fontWeight: 600, color: colors.secondary },
  skillList: { flex: 1, fontSize: 8.5, color: colors.muted },
  // Company
  companyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2, marginTop: 10 },
  companyName: { fontSize: 11, fontWeight: 700 },
  companyPeriod: { fontSize: 8.5, color: colors.muted },
  companyRole: { fontSize: 9, color: colors.muted, marginBottom: 6 },
  // Project
  projectBox: { marginBottom: 14, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.border },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  projectName: { fontSize: 9.5, fontWeight: 600, marginBottom: 2 },
  projectPeriod: { fontSize: 8, color: colors.muted },
  techRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  techBadge: { fontSize: 7.5, color: colors.accent, backgroundColor: "#eff6ff", paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3 },
  taskItem: { fontSize: 8.5, color: colors.secondary, marginBottom: 8, paddingLeft: 8, lineHeight: 1.6 },
  detailItem: { fontSize: 8, color: colors.muted, marginBottom: 3, marginTop: -4, paddingLeft: 20, lineHeight: 1.6 },
  achievementItem: { fontSize: 8.5, color: colors.primary, fontWeight: 500, marginBottom: 8, paddingLeft: 8, lineHeight: 1.6 },
  subLabel: { fontSize: 8, fontWeight: 600, color: colors.muted, marginBottom: 3, marginTop: 6 },
  // Certifications
  certRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  certName: { fontSize: 9, color: colors.secondary },
  certYear: { fontSize: 8.5, color: colors.muted },
  // Highlights
  highlightBox: { backgroundColor: colors.bgLight, borderRadius: 4, padding: 10, marginBottom: 12 },
  highlightLabel: { fontSize: 8, fontWeight: 600, color: colors.muted, marginBottom: 5 },
  highlightItem: { fontSize: 8.5, color: colors.secondary, marginBottom: 3, paddingLeft: 8, lineHeight: 1.6 },
  boldText: { fontWeight: 700 },
  contactText: { fontSize: 8.5, color: colors.muted },
  // URLs
  urlRow: { flexDirection: "row", marginBottom: 4 },
  urlLabel: { width: 55, fontSize: 8.5, fontWeight: 600, color: colors.secondary },
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

function CompanySection({ company }: { company: Company }) {
  const companyProjects = company.projects
    .map((ps) => PROJECTS.find((p) => p.slug === ps.slug))
    .filter(Boolean)

  return (
    <View>
      <View style={s.companyHeader}>
        <Text style={s.companyName}>{company.name}</Text>
        <Text style={s.companyPeriod}>{company.period}</Text>
      </View>
      <Text style={s.companyRole}>{company.role}</Text>

      {company.highlights && company.highlights.length > 0 && (
        <View style={s.highlightBox}>
          <Text style={s.highlightLabel}>주요 성과</Text>
          {company.highlights.map((h, i) => (
            <BoldText key={i} style={s.highlightItem}>{"• " + h}</BoldText>
          ))}
        </View>
      )}

      {companyProjects.map((project) => (
        <View key={project!.slug} style={s.projectBox}>
          <Text style={s.projectName}>{project!.name}</Text>
          <View style={s.techRow}>
            {project!.tech.map((t) => (
              <Text key={t} style={s.techBadge}>{t}</Text>
            ))}
          </View>
          {project!.tasks.map((task, i) => (
            <View key={i}>
              <BoldText style={s.taskItem}>{"- " + task.content}</BoldText>
              {task.details?.map((detail, j) => (
                <BoldText key={j} style={s.detailItem}>{"→ " + detail}</BoldText>
              ))}
            </View>
          ))}
          {project!.achievements && project!.achievements.length > 0 && (
            <>
              <Text style={s.subLabel}>Achievements</Text>
              {project!.achievements.map((ach, i) => (
                <BoldText key={i} style={s.achievementItem}>{"- " + ach}</BoldText>
              ))}
            </>
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
            <Text style={s.contactText}>{PROFILE.phone}</Text>
          </View>
          <Text style={s.intro}>{PROFILE.introduction}</Text>
        </View>

        {/* Experience */}
        <Text style={s.sectionTitle}>Experience</Text>
        {COMPANIES.map((company) => (
          <CompanySection key={company.name} company={company} />
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
          <Link src="https://devy1540.github.io" style={s.contactLink}>https://devy1540.github.io</Link>
        </View>
      </Page>
    </Document>
  )
}
