import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
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
  projectBox: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.border },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  projectName: { fontSize: 9.5, fontWeight: 600 },
  projectPeriod: { fontSize: 8, color: colors.muted },
  techRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  techBadge: { fontSize: 7.5, color: colors.accent, backgroundColor: "#eff6ff", paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3 },
  taskItem: { fontSize: 8.5, color: colors.secondary, marginBottom: 2, paddingLeft: 8, lineHeight: 1.5 },
  achievementItem: { fontSize: 8.5, color: colors.primary, fontWeight: 500, marginBottom: 2, paddingLeft: 8, lineHeight: 1.5 },
  subLabel: { fontSize: 8, fontWeight: 600, color: colors.muted, marginBottom: 2, marginTop: 4 },
  // Certifications
  certRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  certName: { fontSize: 9, color: colors.secondary },
  certYear: { fontSize: 8.5, color: colors.muted },
})

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

      {companyProjects.map((project) => (
        <View key={project!.slug} style={s.projectBox} wrap={false}>
          <View style={s.projectHeader}>
            <Text style={s.projectName}>{project!.name}</Text>
            <Text style={s.projectPeriod}>{project!.period}</Text>
          </View>
          <View style={s.techRow}>
            {project!.tech.map((t) => (
              <Text key={t} style={s.techBadge}>{t}</Text>
            ))}
          </View>
          <Text style={s.subLabel}>Tasks</Text>
          {project!.tasks.map((task, i) => (
            <View key={i}>
              <Text style={s.taskItem}>- {task.content}</Text>
              {task.details?.map((detail, j) => (
                <Text key={j} style={s.achievementItem}>  - {detail}</Text>
              ))}
            </View>
          ))}
          {project!.achievements && project!.achievements.length > 0 && (
            <>
              <Text style={s.subLabel}>Achievements</Text>
              {project!.achievements.map((ach, i) => (
                <Text key={i} style={s.achievementItem}>- {ach}</Text>
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
            <Link src={PROFILE.github} style={s.contactLink}>{PROFILE.github}</Link>
          </View>
          <Text style={s.intro}>{PROFILE.introduction}</Text>
        </View>

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

        {/* Experience */}
        <Text style={s.sectionTitle}>Experience</Text>
        {COMPANIES.map((company) => (
          <CompanySection key={company.name} company={company} />
        ))}
      </Page>
    </Document>
  )
}
