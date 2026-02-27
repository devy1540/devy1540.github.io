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
    views: string
    draftBanner: string
    scheduledBanner: (date: string) => string
  }
  posts: {
    description: string
    listView: string
    gridView: string
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
  }
  series: {
    description: string
    postCount: (count: number, date: string) => string
    noSeries: string
    allSeries: string
    noPostsInSeries: string
  }
  tags: {
    description: string
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
  }
  about: {
    description: string
    introduction: string
    skills: string
    experience: string
    projects: string
    contact: string
    tasks: string
    achievements: string
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
    recentPosts: "Recent Posts",
    goHome: "홈으로 돌아가기",
    viewAll: "전체 보기",
  },
  home: {
    subtitle: "개발하며 배운 것들을 정리하고 공유합니다.",
    viewPosts: "글 목록 보기",
    introduction: "소개",
    popularPosts: "Popular Posts",
    statsPosts: "posts",
    statsSeries: "series",
    statsTags: "tags",
    statsViews: "views",
  },
  post: {
    notFound: "글을 찾을 수 없습니다",
    backToHome: "홈으로 돌아가기",
    backToList: "목록으로",
    prevPost: "이전 글",
    nextPost: "다음 글",
    views: "views",
    draftBanner: "이 글은 아직 작성 중이며, 프로덕션에서는 표시되지 않습니다.",
    scheduledBanner: (date) => `이 글은 ${date}에 발행 예정이며, 그 전까지 프로덕션에서 표시되지 않습니다.`,
  },
  posts: {
    description: "전체 블로그 글 목록",
    listView: "List view",
    gridView: "Grid view",
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
  },
  series: {
    description: "시리즈별 블로그 글 목록",
    postCount: (count, date) => `${count}개의 포스트 · ${date}`,
    noSeries: "시리즈가 없습니다.",
    allSeries: "All series",
    noPostsInSeries: "해당 시리즈의 글이 없습니다.",
  },
  tags: {
    description: "태그별 블로그 글 목록",
    noTags: "태그가 없습니다.",
    allTags: "All tags",
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
    popularPosts: "인기 글 Top 10",
    rank: "순위",
    views: "조회수",
    tagDistribution: "태그 분포",
    monthlyPosts: "월별 포스팅 현황",
    postsCount: "글 수",
    others: "기타",
    noData: "데이터 없음",
  },
  about: {
    description: "복잡한 비즈니스 요구사항을 빠르게 제품으로 만들어내는 백엔드 엔지니어입니다.",
    introduction: "자기소개",
    skills: "기술 스택",
    experience: "경력",
    projects: "프로젝트",
    contact: "연락처",
    tasks: "수행 내용",
    achievements: "성과",
    backToAbout: "About으로 돌아가기",
  },
  components: {
    noPostsYet: "아직 작성된 글이 없습니다.",
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
    tableOfContents: "목차",
    copyCode: "코드 복사",
    selectDate: "날짜 선택",
    scrollToTop: "Scroll to top",
    toggleLanguage: "Toggle language",
    keyboardShortcuts: "단축키",
    shortcutSearch: "검색 열기",
    shortcutHelp: "단축키 안내 열기",
    shortcutSidebar: "사이드바 토글",
    general: "일반",
  },
  meta: {
    siteName: "Devy's Blog",
    defaultDescription: "개발하며 배운 것들을 정리하고 공유합니다.",
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
    subtitle: "Documenting and sharing what I learn through development.",
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
    views: "views",
    draftBanner: "This post is a draft and will not be visible in production.",
    scheduledBanner: (date) => `This post is scheduled for ${date} and will not be visible in production until then.`,
  },
  posts: {
    description: "All blog posts",
    listView: "List view",
    gridView: "Grid view",
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
  },
  series: {
    description: "Blog posts by series",
    postCount: (count, date) => `${count} post${count !== 1 ? "s" : ""} · ${date}`,
    noSeries: "No series yet.",
    allSeries: "All series",
    noPostsInSeries: "No posts in this series.",
  },
  tags: {
    description: "Blog posts by tag",
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
  },
  about: {
    description: "Backend engineer who rapidly turns complex business requirements into products.",
    introduction: "About Me",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
    contact: "Contact",
    tasks: "Tasks",
    achievements: "Achievements",
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
    siteName: "Devy's Blog",
    defaultDescription: "Documenting and sharing what I learn through development.",
  },
}
