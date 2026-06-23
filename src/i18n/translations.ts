export type Language = "ko" | "en"

export interface Translations {
  common: {
    home: string
    posts: string
    series: string
    search: string
    tags: string
    analytics: string
    about: string
    recentPosts: string
    goHome: string
    viewAll: string
  }
  home: {
    subtitle: string
    viewPosts: string
    introduction: string
    popularPosts: string
    statsPosts: string
    statsSeries: string
    statsTags: string
    statsViews: string
  }
  post: {
    notFound: string
    backToHome: string
    backToList: string
    prevPost: string
    nextPost: string
    readingTime: (minutes: number) => string
    views: string
    translation: string
    languageKo: string
    languageEn: string
    translationUnavailableTitle: string
    translationUnavailableDescription: string
    readKoreanPost: string
    draftBanner: string
    scheduledBanner: (date: string) => string
  }
  posts: {
    description: string
    listView: string
    gridView: string
    searchPlaceholder: string
    sortLabel: string
    yearLabel: string
    scopeLabel: string
    sortLatest: string
    sortPopular: string
    sortOldest: string
    allYears: string
    allTags: string
    scopeAll: string
    scopeSummary: string
    scopeTags: string
    reset: string
    totalCount: (count: number) => string
    filteredCount: (count: number) => string
    noResults: string
  }
  search: {
    description: string
    placeholder: string
    dateFrom: string
    dateTo: string
    tagFilter: string
    resultCount: (count: number) => string
    reset: string
    noResults: string
    searchGuide: string
    redirectTitle: string
    redirectDescription: string
    goToPosts: string
  }
  series: {
    description: string
    summary: (postCount: number, seriesCount: number) => string
    searchPlaceholder: string
    sortRecent: string
    sortCount: string
    sortName: string
    reset: string
    selectedLabel: (series: string) => string
    topSeries: string
    topSeriesNote: string
    topicGroups: string
    ungrouped: string
    postCount: (count: number, date: string) => string
    postCountShort: (count: number) => string
    fallbackDescription: (series: string) => string
    readingPath: string
    relatedTags: string
    startReading: string
    noSeries: string
    noMatchingSeries: string
    allSeries: string
    noPostsInSeries: string
  }
  tags: {
    description: string
    summary: (postCount: number, tagCount: number) => string
    searchPlaceholder: string
    sortPopular: string
    sortRecent: string
    sortName: string
    reset: string
    selectedLabel: (tag: string) => string
    topTags: string
    topTagsNote: string
    topicGroups: string
    ungrouped: string
    postCount: (count: number) => string
    relatedTags: string
    recentPosts: string
    selectedDescription: (tag: string) => string
    viewInPosts: (tag: string) => string
    noMatchingTags: string
    noTags: string
    allTags: string
    noPostsWithTag: string
  }
  notFound: {
    title: string
    errorTitle: string
    errorMessage: string
  }
  analytics: {
    description: string
    totalViews: string
    totalPosts: string
    totalSeries: string
    totalTags: string
    draftPosts: string
    popularPosts: string
    rank: string
    views: string
    tagDistribution: string
    monthlyPosts: string
    postsCount: string
    others: string
    noData: string
    lastUpdated: string
    loadError: string
    showingCachedData: string
    refresh: string
    range7d: string
    range14d: string
    range30d: string
    trafficMomentum: string
    viewsInRange: string
    avgDailyViews: string
    peakDay: string
    periodChange: string
    compareUnavailable: string
    contentInsights: string
    fastestPosts: string
    tagPerformance: string
    seriesPerformance: string
    viewsPerDay: string
    averageViews: string
    allTimeBasis: string
    noSeriesData: string
  }
  about: {
    description: string
    introduction: string
    skills: string
    experience: string
    projects: string
    contact: string
    highlights: string
    tasks: string
    achievements: string
    certifications: string
    relatedPosts: string
    backToAbout: string
  }
  components: {
    noPostsYet: string
    searchPosts: string
    searchPostsDescription: string
    searchPlaceholder: string
    noResults: string
    postsGroup: string
    themeLight: string
    themeDark: string
    themeSystem: string
    toggleTheme: string
    colorTheme: string
    totalViews: string
    last30Days: string
    tableOfContents: string
    copyCode: string
    selectDate: string
    scrollToTop: string
    toggleLanguage: string
    keyboardShortcuts: string
    shortcutSearch: string
    shortcutSidebar: string
    shortcutHelp: string
    general: string
  }
  meta: {
    siteName: string
    homeTitle: string
    defaultDescription: string
  }
}

export const ko: Translations = {
  common: {
    home: "홈",
    posts: "글 목록",
    series: "시리즈",
    search: "검색",
    tags: "태그",
    analytics: "분석",
    about: "소개",
    recentPosts: "최근 글",
    goHome: "홈으로 돌아가기",
    viewAll: "전체 보기",
  },
  home: {
    subtitle: "백엔드 개발과 플랫폼 운영에서 마주한 문제, 선택, 해결 과정을 기록합니다.",
    viewPosts: "글 목록 보기",
    introduction: "소개",
    popularPosts: "인기 글",
    statsPosts: "글",
    statsSeries: "시리즈",
    statsTags: "태그",
    statsViews: "조회",
  },
  post: {
    notFound: "글을 찾을 수 없습니다",
    backToHome: "홈으로 돌아가기",
    backToList: "목록으로",
    prevPost: "이전 글",
    nextPost: "다음 글",
    readingTime: (minutes) => `${minutes}분 읽기`,
    views: "조회",
    translation: "번역",
    languageKo: "한국어",
    languageEn: "English",
    translationUnavailableTitle: "영어 번역이 아직 없습니다",
    translationUnavailableDescription: "이 글은 아직 영어로 번역되지 않았습니다. 한국어 원문은 바로 읽을 수 있습니다.",
    readKoreanPost: "한국어 원문 보기",
    draftBanner: "이 글은 아직 작성 중이며, 프로덕션에서는 표시되지 않습니다.",
    scheduledBanner: (date) => `이 글은 ${date}에 발행 예정이며, 그 전까지 프로덕션에서 표시되지 않습니다.`,
  },
  posts: {
    description: "전체 블로그 글 목록",
    listView: "리스트 보기",
    gridView: "그리드 보기",
    searchPlaceholder: "제목, 설명, 태그, 본문 검색",
    sortLabel: "정렬",
    yearLabel: "연도",
    scopeLabel: "검색 범위",
    sortLatest: "최신순",
    sortPopular: "인기순",
    sortOldest: "오래된순",
    allYears: "전체 연도",
    allTags: "전체",
    scopeAll: "제목, 설명, 태그, 본문",
    scopeSummary: "제목, 설명, 태그",
    scopeTags: "태그만",
    reset: "초기화",
    totalCount: (count) => `${count}개의 글을 최신순으로 보고 있습니다.`,
    filteredCount: (count) => `${count}개의 글을 찾았습니다.`,
    noResults: "조건에 맞는 글이 없습니다.",
  },
  search: {
    description: "블로그 글 검색",
    placeholder: "키워드 검색...",
    dateFrom: "시작일",
    dateTo: "종료일",
    tagFilter: "태그 필터",
    resultCount: (count) => `${count}개의 결과`,
    reset: "초기화",
    noResults: "검색 결과가 없습니다.",
    searchGuide: "키워드, 날짜, 태그를 선택하여 검색하세요.",
    redirectTitle: "검색이 글 목록으로 통합되었습니다",
    redirectDescription: "글 검색과 필터는 이제 글 목록에서 함께 사용할 수 있습니다.",
    goToPosts: "글 목록으로 이동",
  },
  series: {
    description: "시리즈별 블로그 글 목록",
    summary: (postCount, seriesCount) => `${postCount}개의 글이 ${seriesCount}개의 시리즈로 정리되어 있습니다.`,
    searchPlaceholder: "시리즈, 태그, 설명으로 검색",
    sortRecent: "최근순",
    sortCount: "글 많은순",
    sortName: "이름순",
    reset: "초기화",
    selectedLabel: (series) => `선택됨 · ${series}`,
    topSeries: "주요 시리즈",
    topSeriesNote: "최근 업데이트와 글 수 기준",
    topicGroups: "주제 그룹",
    ungrouped: "기타",
    postCount: (count, date) => `${count}개의 글 · ${date}`,
    postCountShort: (count) => `${count}편`,
    fallbackDescription: (series) => `${series} 시리즈의 글을 순서대로 모아 봅니다.`,
    readingPath: "읽기 순서",
    relatedTags: "관련 태그",
    startReading: "첫 글부터 읽기",
    noSeries: "시리즈가 없습니다.",
    noMatchingSeries: "조건에 맞는 시리즈가 없습니다.",
    allSeries: "전체 시리즈",
    noPostsInSeries: "해당 시리즈의 글이 없습니다.",
  },
  tags: {
    description: "태그별 블로그 글 목록",
    summary: (postCount, tagCount) => `${postCount}개의 글이 ${tagCount}개의 태그로 정리되어 있습니다.`,
    searchPlaceholder: "태그 이름 검색",
    sortPopular: "많은 글순",
    sortRecent: "최근 글순",
    sortName: "가나다순",
    reset: "초기화",
    selectedLabel: (tag) => `선택됨 · ${tag}`,
    topTags: "주요 태그",
    topTagsNote: "글 수와 최근 발행 기준",
    topicGroups: "주제 그룹",
    ungrouped: "기타",
    postCount: (count) => `${count}개 글`,
    relatedTags: "관련 태그",
    recentPosts: "최근 글",
    selectedDescription: (tag) => `${tag} 태그가 붙은 글의 흐름과 함께 자주 등장하는 주제를 모아봅니다.`,
    viewInPosts: (tag) => `${tag} 글 목록으로 보기`,
    noMatchingTags: "조건에 맞는 태그가 없습니다.",
    noTags: "태그가 없습니다.",
    allTags: "전체 태그",
    noPostsWithTag: "해당 태그의 글이 없습니다.",
  },
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    errorTitle: "문제가 발생했습니다",
    errorMessage: "페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
  },
  analytics: {
    description: "블로그 통계 및 분석",
    totalViews: "전체 조회수",
    totalPosts: "전체 글 수",
    totalSeries: "시리즈 수",
    totalTags: "태그 수",
    draftPosts: "작성 중인 글",
    popularPosts: "인기 글 10개",
    rank: "순위",
    views: "조회수",
    tagDistribution: "태그 분포",
    monthlyPosts: "월별 포스팅 현황",
    postsCount: "글 수",
    others: "기타",
    noData: "데이터 없음",
    lastUpdated: "마지막 업데이트",
    loadError: "조회수 데이터를 불러올 수 없습니다",
    showingCachedData: "캐시된 데이터를 표시합니다",
    refresh: "새로고침",
    range7d: "7일",
    range14d: "14일",
    range30d: "30일",
    trafficMomentum: "트래픽 모멘텀",
    viewsInRange: "선택 기간 조회수",
    avgDailyViews: "일평균 조회수",
    peakDay: "최고 유입일",
    periodChange: "이전 기간 대비",
    compareUnavailable: "비교 데이터 부족",
    contentInsights: "콘텐츠 인사이트",
    fastestPosts: "빠르게 읽히는 글",
    tagPerformance: "태그별 성과",
    seriesPerformance: "시리즈별 성과",
    viewsPerDay: "일평균",
    averageViews: "평균 조회수",
    allTimeBasis: "전체 기간 기준",
    noSeriesData: "시리즈 데이터 없음",
  },
  about: {
    description: "비즈니스 흐름을 제품 기능으로 만들고, 안정적으로 확장되는 서비스 구조까지 설계하는 백엔드 엔지니어입니다.",
    introduction: "자기소개",
    skills: "기술 스택",
    experience: "경력",
    projects: "프로젝트",
    contact: "연락처",
    highlights: "주요 성과",
    tasks: "수행 내용",
    achievements: "성과",
    certifications: "자격증",
    relatedPosts: "관련 글",
    backToAbout: "소개로 돌아가기",
  },
  components: {
    noPostsYet: "아직 작성된 글이 없습니다.",
    searchPosts: "글 검색",
    searchPostsDescription: "제목, 설명, 태그, 본문에서 글을 검색합니다.",
    searchPlaceholder: "글 검색...",
    noResults: "검색 결과가 없습니다.",
    postsGroup: "글",
    themeLight: "라이트",
    themeDark: "다크",
    themeSystem: "시스템",
    toggleTheme: "테마 변경",
    colorTheme: "색상 테마 변경",
    totalViews: "전체 조회수",
    last30Days: "최근 30일",
    tableOfContents: "목차",
    copyCode: "코드 복사",
    selectDate: "날짜 선택",
    scrollToTop: "맨 위로",
    toggleLanguage: "언어 변경",
    keyboardShortcuts: "단축키",
    shortcutSearch: "검색 열기",
    shortcutHelp: "단축키 안내 열기",
    shortcutSidebar: "사이드바 토글",
    general: "일반",
  },
  meta: {
    siteName: "Devy Archive",
    homeTitle: "백엔드·인프라 개발 기록",
    defaultDescription: "Devy의 개발과 운영 기록을 문제 해결 중심으로 모아둔 아카이브입니다.",
  },
}

export const en: Translations = {
  common: {
    home: "Home",
    posts: "Posts",
    series: "Series",
    search: "Search",
    tags: "Tags",
    analytics: "Analytics",
    about: "About",
    recentPosts: "Recent Posts",
    goHome: "Go Home",
    viewAll: "View All",
  },
  home: {
    subtitle: "Notes on backend engineering, platform operations, and the decisions behind them.",
    viewPosts: "View Posts",
    introduction: "About",
    popularPosts: "Popular Posts",
    statsPosts: "posts",
    statsSeries: "series",
    statsTags: "tags",
    statsViews: "views",
  },
  post: {
    notFound: "Post not found",
    backToHome: "Go Home",
    backToList: "Back to list",
    prevPost: "Previous",
    nextPost: "Next",
    readingTime: (minutes) => `${minutes} min read`,
    views: "views",
    translation: "Translation",
    languageKo: "Korean",
    languageEn: "English",
    translationUnavailableTitle: "English version is not available yet",
    translationUnavailableDescription: "This post has not been translated into English yet. The original Korean post is available.",
    readKoreanPost: "Read the Korean post",
    draftBanner: "This post is a draft and will not be visible in production.",
    scheduledBanner: (date) => `This post is scheduled for ${date} and will not be visible in production until then.`,
  },
  posts: {
    description: "All blog posts",
    listView: "List view",
    gridView: "Grid view",
    searchPlaceholder: "Search title, description, tags, or content",
    sortLabel: "Sort",
    yearLabel: "Year",
    scopeLabel: "Search scope",
    sortLatest: "Latest",
    sortPopular: "Popular",
    sortOldest: "Oldest",
    allYears: "All years",
    allTags: "All",
    scopeAll: "Title, description, tags, content",
    scopeSummary: "Title, description, tags",
    scopeTags: "Tags only",
    reset: "Reset",
    totalCount: (count) => `Showing ${count} post${count !== 1 ? "s" : ""} by latest date.`,
    filteredCount: (count) => `Found ${count} post${count !== 1 ? "s" : ""}.`,
    noResults: "No posts match these filters.",
  },
  search: {
    description: "Search blog posts",
    placeholder: "Search by keyword...",
    dateFrom: "From",
    dateTo: "To",
    tagFilter: "Tag filter",
    resultCount: (count) => `${count} result${count !== 1 ? "s" : ""}`,
    reset: "Reset",
    noResults: "No results found.",
    searchGuide: "Search by keyword, date, or tag.",
    redirectTitle: "Search moved to Posts",
    redirectDescription: "Post search and filters are now available directly in the posts list.",
    goToPosts: "Go to posts",
  },
  series: {
    description: "Blog posts by series",
    summary: (postCount, seriesCount) => `${postCount} post${postCount !== 1 ? "s" : ""} are organized into ${seriesCount} series.`,
    searchPlaceholder: "Search series, tags, or descriptions",
    sortRecent: "Recent",
    sortCount: "Most posts",
    sortName: "A-Z",
    reset: "Reset",
    selectedLabel: (series) => `Selected · ${series}`,
    topSeries: "Top Series",
    topSeriesNote: "Sorted by recent updates and post count",
    topicGroups: "Topic Groups",
    ungrouped: "Other",
    postCount: (count, date) => `${count} post${count !== 1 ? "s" : ""} · ${date}`,
    postCountShort: (count) => `${count} post${count !== 1 ? "s" : ""}`,
    fallbackDescription: (series) => `Read the ${series} series in order.`,
    readingPath: "Reading Path",
    relatedTags: "Related Tags",
    startReading: "Start reading",
    noSeries: "No series yet.",
    noMatchingSeries: "No series match these filters.",
    allSeries: "All series",
    noPostsInSeries: "No posts in this series.",
  },
  tags: {
    description: "Blog posts by tag",
    summary: (postCount, tagCount) => `${postCount} post${postCount !== 1 ? "s" : ""} are organized with ${tagCount} tag${tagCount !== 1 ? "s" : ""}.`,
    searchPlaceholder: "Search tags",
    sortPopular: "Most used",
    sortRecent: "Recent",
    sortName: "A-Z",
    reset: "Reset",
    selectedLabel: (tag) => `Selected · ${tag}`,
    topTags: "Top Tags",
    topTagsNote: "By post count and latest publish date",
    topicGroups: "Topic Groups",
    ungrouped: "Other",
    postCount: (count) => `${count} post${count !== 1 ? "s" : ""}`,
    relatedTags: "Related Tags",
    recentPosts: "Recent Posts",
    selectedDescription: (tag) => `Explore posts tagged with ${tag} and the topics that often appear with it.`,
    viewInPosts: (tag) => `View ${tag} posts`,
    noMatchingTags: "No tags match these filters.",
    noTags: "No tags yet.",
    allTags: "All tags",
    noPostsWithTag: "No posts with this tag.",
  },
  notFound: {
    title: "Page not found",
    errorTitle: "Something went wrong",
    errorMessage: "An error occurred while loading the page. Please try again.",
  },
  analytics: {
    description: "Blog statistics and analytics",
    totalViews: "Total Views",
    totalPosts: "Total Posts",
    totalSeries: "Total Series",
    totalTags: "Total Tags",
    draftPosts: "Drafts",
    popularPosts: "Popular Posts Top 10",
    rank: "Rank",
    views: "Views",
    tagDistribution: "Tag Distribution",
    monthlyPosts: "Monthly Posts",
    postsCount: "Posts",
    others: "Others",
    noData: "No data",
    lastUpdated: "Last updated",
    loadError: "Could not load view data",
    showingCachedData: "Showing cached data",
    refresh: "Refresh",
    range7d: "7 days",
    range14d: "14 days",
    range30d: "30 days",
    trafficMomentum: "Traffic Momentum",
    viewsInRange: "Views in range",
    avgDailyViews: "Daily average",
    peakDay: "Peak day",
    periodChange: "vs previous period",
    compareUnavailable: "Not enough comparison data",
    contentInsights: "Content Insights",
    fastestPosts: "Fastest Posts",
    tagPerformance: "Tag Performance",
    seriesPerformance: "Series Performance",
    viewsPerDay: "views/day",
    averageViews: "Avg views",
    allTimeBasis: "All-time basis",
    noSeriesData: "No series data",
  },
  about: {
    description: "Backend engineer who turns business flows into product features and designs service structures that scale reliably.",
    introduction: "About Me",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
    contact: "Contact",
    highlights: "Highlights",
    tasks: "Tasks",
    achievements: "Achievements",
    certifications: "Certifications",
    relatedPosts: "Related Posts",
    backToAbout: "Back to About",
  },
  components: {
    noPostsYet: "No posts yet.",
    searchPosts: "Search Posts",
    searchPostsDescription: "Search blog posts by title, description, tags, or content.",
    searchPlaceholder: "Search posts...",
    noResults: "No results found.",
    postsGroup: "Posts",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    toggleTheme: "Toggle theme",
    colorTheme: "Change color theme",
    totalViews: "Total Views",
    last30Days: "Last 30 Days",
    tableOfContents: "Table of Contents",
    copyCode: "Copy code",
    selectDate: "Select date",
    scrollToTop: "Scroll to top",
    toggleLanguage: "Toggle language",
    keyboardShortcuts: "Keyboard Shortcuts",
    shortcutSearch: "Open search",
    shortcutHelp: "Open shortcuts guide",
    shortcutSidebar: "Toggle sidebar",
    general: "General",
  },
  meta: {
    siteName: "Devy Archive",
    homeTitle: "Backend and Infrastructure Engineering Notes",
    defaultDescription: "An archive of Devy's development and operations notes, organized around problem solving.",
  },
}
