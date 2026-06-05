import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

type ContactLink = { label: string; url: string } | string;

export type TailoredCvData = {
  job_title: string;
  company: string;
  contact: {
    name: string;
    title?: string;
    email: string;
    phone: string;
    location: string;
    links: ContactLink[];
  };
  summary: string;
  experience: Array<{
    title: string;
    employer: string;
    dates: string;
    location: string;
    bullets: string[];
  }>;
  key_achievements?: string[];
  skills: string[] | { categorised: Array<{ category: string; items: string[] }> };
  education: Array<{
    degree: string;
    institution: string;
    dates: string;
    location?: string;
    notes?: string;
  }>;
  flagged_gaps: string[];
};

function clean(val: string | null | undefined): string {
  if (!val) return '';
  const t = val.trim();
  if (/^(n\/a|none|-|–|—|null|undefined)$/i.test(t)) return '';
  return t;
}

function normalizeSkills(
  skills: TailoredCvData['skills']
): Array<{ category: string; items: string[] }> {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    const cleaned = skills.map(clean).filter(Boolean);
    return cleaned.length ? [{ category: '', items: cleaned }] : [];
  }
  return (skills.categorised ?? []).filter((cat) =>
    (cat.items ?? []).some((item) => clean(item))
  );
}

function normalizeLinks(links: ContactLink[]): Array<{ label: string; url: string }> {
  return (links ?? [])
    .map((link) => {
      if (typeof link === 'string') {
        const t = clean(link);
        if (!t) return null;
        const isUrl = /^https?:\/\//i.test(t) || t.startsWith('www.');
        return {
          label: t,
          url: isUrl ? (t.startsWith('www.') ? `https://${t}` : t) : '',
        };
      }
      const label = clean(link.label) || clean(link.url);
      let url = clean(link.url);
      if (url.startsWith('www.')) url = `https://${url}`;
      return label ? { label, url } : null;
    })
    .filter(Boolean) as Array<{ label: string; url: string }>;
}

const NAVY = '#1a2a4a';
const MARGIN = 43;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111111',
    backgroundColor: '#ffffff',
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 2,
  },
  contactTitle: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 4,
  },
  contactBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  contactSep: {
    fontSize: 9,
    color: '#aaaaaa',
    marginHorizontal: 3,
  },
  contactText: {
    fontSize: 9,
    color: '#333333',
  },
  contactLink: {
    fontSize: 9,
    color: NAVY,
    textDecoration: 'none',
  },
  headerRule: {
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: NAVY,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#111111',
  },
  jobBlock: {
    marginBottom: 9,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    flex: 1,
  },
  jobDates: {
    fontSize: 9,
    color: '#555555',
    marginLeft: 8,
    flexShrink: 0,
  },
  jobEmployer: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#444444',
    marginBottom: 4,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  bulletDot: {
    fontSize: 10,
    color: NAVY,
    marginRight: 5,
    lineHeight: 1.4,
    width: 8,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#111111',
    lineHeight: 1.4,
  },
  achievementText: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    lineHeight: 1.4,
  },
  skillRow: {
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  skillItems: {
    fontSize: 10,
    color: '#333333',
  },
  eduBlock: {
    marginBottom: 7,
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    flex: 1,
  },
  eduDates: {
    fontSize: 9,
    color: '#555555',
    marginLeft: 8,
    flexShrink: 0,
  },
  eduInstitution: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#444444',
    marginBottom: 1,
  },
  eduNotes: {
    fontSize: 9,
    color: '#555555',
  },
});

export default function TailoredCvDocument({ data }: { data: TailoredCvData }) {
  const { contact, summary, experience, education, key_achievements } = data;

  const candidateName = clean(contact?.name);
  const contactTitle = clean(contact?.title);
  const cleanedSummary = clean(summary);
  const categorisedSkills = normalizeSkills(data.skills);
  const normalizedLinks = normalizeLinks(contact?.links ?? []);
  const cleanedAchievements = (key_achievements ?? []).map(clean).filter(Boolean);

  const contactItems: Array<{ text: string; url?: string }> = [];
  if (clean(contact?.email)) {
    contactItems.push({ text: clean(contact.email), url: `mailto:${clean(contact.email)}` });
  }
  if (clean(contact?.phone)) contactItems.push({ text: clean(contact.phone) });
  if (clean(contact?.location)) contactItems.push({ text: clean(contact.location) });
  for (const link of normalizedLinks) {
    contactItems.push({ text: link.label, url: link.url || undefined });
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* Name */}
        {candidateName ? <Text style={styles.name}>{candidateName}</Text> : null}

        {/* Contact title */}
        {contactTitle ? <Text style={styles.contactTitle}>{contactTitle}</Text> : null}

        {/* Contact bar */}
        {contactItems.length > 0 && (
          <View style={styles.contactBar}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {i > 0 && <Text style={styles.contactSep}> | </Text>}
                {item.url ? (
                  <Link src={item.url}>
                    <Text style={styles.contactLink}>{item.text}</Text>
                  </Link>
                ) : (
                  <Text style={styles.contactText}>{item.text}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.headerRule} />

        {/* Summary */}
        {cleanedSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summaryText}>{cleanedSummary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EXPERIENCE</Text>
            {experience.map((job, i) => {
              const title = clean(job.title);
              const employer = clean(job.employer);
              const dates = clean(job.dates);
              const location = clean(job.location);
              const bullets = (job.bullets ?? []).map(clean).filter(Boolean);
              const employerLine = [employer, location].filter(Boolean).join('  ·  ');

              return (
                <View key={i} style={styles.jobBlock} wrap={false}>
                  <View style={styles.jobRow}>
                    {title ? <Text style={styles.jobTitle}>{title}</Text> : null}
                    {dates ? <Text style={styles.jobDates}>{dates}</Text> : null}
                  </View>
                  {employerLine ? <Text style={styles.jobEmployer}>{employerLine}</Text> : null}
                  {bullets.map((bullet, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Key Achievements */}
        {cleanedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>KEY ACHIEVEMENTS</Text>
            {cleanedAchievements.map((achievement, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {categorisedSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SKILLS</Text>
            {categorisedSkills.map((cat, i) => {
              const cleanItems = cat.items.map(clean).filter(Boolean);
              if (!cleanItems.length) return null;
              const categoryLabel = clean(cat.category);
              return (
                <View key={i} style={styles.skillRow}>
                  <Text>
                    {categoryLabel ? (
                      <Text style={styles.skillCategory}>{categoryLabel}:  </Text>
                    ) : null}
                    <Text style={styles.skillItems}>{cleanItems.join('  ·  ')}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EDUCATION</Text>
            {education.map((edu, i) => {
              const degree = clean(edu.degree);
              const institution = clean(edu.institution);
              const dates = clean(edu.dates);
              const location = clean(edu.location);
              const notes = clean(edu.notes);
              const institutionLine = [institution, location].filter(Boolean).join('  ·  ');
              if (!degree && !institution) return null;
              return (
                <View key={i} style={styles.eduBlock} wrap={false}>
                  <View style={styles.eduRow}>
                    {degree ? <Text style={styles.eduDegree}>{degree}</Text> : null}
                    {dates ? <Text style={styles.eduDates}>{dates}</Text> : null}
                  </View>
                  {institutionLine ? <Text style={styles.eduInstitution}>{institutionLine}</Text> : null}
                  {notes ? <Text style={styles.eduNotes}>{notes}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

      </Page>
    </Document>
  );
}
