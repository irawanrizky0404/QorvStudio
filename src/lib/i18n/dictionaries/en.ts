/**
 * Source of truth for UI copy. `id.ts` must satisfy `Dictionary`, so a missing
 * key is a type error at build time - that is the whole reason we hand-roll i18n.
 *
 * Content copy (project/product/service text) does NOT live here - it lives on
 * the entity as `{ en, id }`. Prices never live here. See AGENT.md §3a.
 */
export const en = {
  meta: {
    siteName: 'QORV Studio',
    defaultTitle: 'QORV - Identity, dimension, and digital systems',
    defaultDescription:
      'We do not design for aesthetics alone. We engineer function. Web, app, 3D, packaging, and brand identity, built on industrial minimalism.',
  },

  nav: {
    home: 'Index',
    work: 'Work',
    services: 'Services',
    products: 'Products',
    pricing: 'Pricing',
    about: 'Studio',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    switchLanguage: 'Switch language',
    skipToContent: 'Skip to content',
  },

  common: {
    loading: 'Loading',
    readMore: 'Read more',
    viewAll: 'View all',
    viewProject: 'View project',
    viewService: 'View service',
    viewProduct: 'View product',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    filter: 'Filter',
    search: 'Search',
    searchPlaceholder: 'Search…',
    sort: 'Sort',
    all: 'All',
    clear: 'Clear',
    clearFilters: 'Clear filters',
    results: 'results',
    noResults: 'No results',
    scrollToExplore: 'Scroll to explore',
    year: 'Year',
    client: 'Client',
    role: 'Role',
    duration: 'Duration',
    category: 'Category',
    status: 'Status',
    retry: 'Try again',
  },

  states: {
    errorTitle: 'Something broke',
    errorBody: 'We could not load this. The studio has been notified.',
    emptyTitle: 'Nothing here yet',
    emptyBody: 'There is no content to show for this selection.',
    notFoundTitle: 'Page not found',
    notFoundBody: 'This route does not exist. It may have moved or never shipped.',
    notFoundCta: 'Back to index',
  },

  home: {
    heroLine1: 'Designing identity.',
    heroLine2: 'Rendering dimension.',
    heroLine3: 'Writing digital ecosystems.',
    heroSub: 'Web / App / 3D design / Packaging / Brand identity',
    intro:
      'QORV does not design for aesthetics alone; we engineer function. The identity is built on industrial minimalism: cold, brutal, high precision. We do not speak sweetly, we execute an absolute technical brief.',
    statementLead: 'A system is finished when it runs in production and your team operates it',
    statementAccent: 'without us.',
    statementTail: 'Everything before that is a rehearsal, not a delivery.',
    capabilities: 'Disciplines',
    capabilitiesTrail: 'we execute',
    capabilitiesBody:
      'Six disciplines. Each carries a written scope, a starting figure, and a stated timeline. The number is published so no call is required to obtain it.',
    selectedWorkTrail: 'and what it changed',
    processTrail: 'on every engagement',
    trustedBy: 'Built for',
    productsTrail: 'we own and operate',
    forWhom: 'For',
    audiences: ['Founders', 'Operators', 'Brand teams', 'Manufacturers'],

    whyLead: 'Operating',
    whyTrail: 'principles',
    whyBody:
      'Six rules the studio runs on. None of them concern how the work looks.',
    reasons: [
      {
        mark: 'A',
        title: 'Absolute ownership',
        body: 'Code, source files, and mesh assets are yours from the first commit. No licence, no lock-in.',
      },
      {
        mark: 'B',
        title: 'Wireframe before render',
        body: 'The mesh is shown before the render, the interface before the backend. Work in progress is the identity, not a stage we hide.',
      },
      {
        mark: 'C',
        title: 'Recorded decisions',
        body: 'Every architectural choice is written down with its trade-off, so the next operator inherits reasoning, not guesswork.',
      },
      {
        mark: 'D',
        title: 'Declared scope',
        body: 'Packages state what is included and what is excluded. Additional hours are agreed before they begin.',
      },
      {
        mark: 'E',
        title: 'Accessible by construction',
        body: 'Keyboard operation, contrast, and reduced motion are constructed in, not retrofitted after an audit.',
      },
      {
        mark: 'F',
        title: 'Handover, not dependency',
        body: 'The engagement ends when your team runs it without us. That is the definition of done, not a courtesy.',
      },
    ],

    testimonialsLead: 'On record',
    testimonialsTrail: 'after handover',
    testimonialsBody:
      'Each statement links to the project it refers to, so the claim can be checked against the work.',

    faqLead: 'Questions',
    faqTrail: 'before you write',
    faqBody: 'Asked on the first call, answered here instead.',

    selectedWork: 'Selected work',
    ourProducts: 'Our products',
    pricingTeaser: 'Engagements',
    pricingTeaserBody: 'Published starting figures. Final scope is fixed in writing before work begins.',
    ctaTitle: 'State the problem.',
    ctaBody: 'Describe what has to exist and what it must do. We return scope, figure, and timeline.',
    ctaButton: 'Open a brief',
  },

  work: {
    title: 'Work',
    subtitle: 'Systems delivered. Not mockups.',
    allCategories: 'All categories',
    challenge: 'The challenge',
    solution: 'The solution',
    outcome: 'The outcome',
    results: 'Results',
    stack: 'Stack',
    servicesUsed: 'Services applied',
    gallery: 'Gallery',
    liveSite: 'Live site',
    nextProject: 'Next project',
    emptyBody: 'No projects match this filter yet.',
  },

  services: {
    title: 'Services',
    subtitle: 'Six disciplines, executed to a written scope.',
    startingFrom: 'From',
    typicalTimeline: 'Typical timeline',
    deliverables: 'Deliverables',
    process: 'Process',
    tools: 'Tools',
    packages: 'Packages',
    relatedProjects: 'Work delivered with this service',
    relatedServices: 'Related services',
    faq: 'Questions',
    step: 'Step',
    emptyBody: 'No services published yet.',
  },

  products: {
    title: 'Products',
    subtitle: 'Software the studio owns and operates.',
    overview: 'Overview',
    features: 'Features',
    specs: 'Specifications',
    platforms: 'Platforms',
    techStack: 'Built with',
    integrations: 'Integrations',
    requirements: 'Requirements',
    faq: 'Questions',
    changelog: 'Changelog',
    version: 'Version',
    lastUpdated: 'Last updated',
    demo: 'Live demo',
    demoVideo: 'Demo video',
    gallery: 'Gallery',
    docs: 'Documentation',
    related: 'Related products',
    emptyBody: 'No products published yet.',
    status: {
      available: 'Available',
      beta: 'Beta',
      'coming-soon': 'Coming soon',
    },
  },

  pricing: {
    title: 'Pricing',
    subtitle: 'Published starting figures. Scope determines the final number.',
    servicesHeading: 'Service packages',
    matrixBody: 'Six services, three tiers each. The numbers below are starting points; scope decides the final figure.',
    service: 'Service',
    seeDetail: 'See package detail',
    productsHeading: 'Product licensing',
    contactUs: 'Contact us',
    from: 'From',
    requestQuote: 'Request a quote',
    inquireAbout: 'Inquire about',
    includes: 'Includes',
    recommended: 'Recommended',
    faqHeading: 'Terms of engagement',
    /** Fixed ladder - ADR-011. Labels live here, never on the entity. */
    tier: {
      basic: 'Basic',
      gold: 'Gold',
      premium: 'Premium',
    },
    period: {
      'one-time': 'one-time',
      monthly: 'per month',
      yearly: 'per year',
      project: 'per project',
    },
    unit: {
      project: 'per project',
      month: 'per month',
      year: 'per year',
      license: 'per licence',
      day: 'per day',
    },
  },

  about: {
    title: 'Studio',
    subtitle: 'Cold, brutal, high precision.',
    persona: 'Brand persona',
    capabilities: 'Disciplines',
    process: 'Operating principles',
    statProjects: 'Projects delivered',
    statServices: 'Capabilities',
    statSince: 'Working since',
    statLocales: 'Languages',
  },

  contact: {
    title: 'Contact',
    subtitle: 'State what has to be built.',
    emailUs: 'Email',
    chatUs: 'WhatsApp',
    directTitle: 'Direct channels',
    formTitle: 'Submit a brief',
  },

  inquiry: {
    title: 'Open a brief',
    subtitle: 'Answered within two working days.',
    contextService: 'Service',
    contextProduct: 'Product',
    contextProject: 'Project',
    contextTier: 'Package',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    company: 'Company',
    companyPlaceholder: 'Optional',
    phone: 'Phone',
    phonePlaceholder: 'Optional',
    subject: 'Subject',
    subjectPlaceholder: 'What is this about?',
    message: 'Brief',
    messagePlaceholder: 'What has to exist, what must it do, and how is success measured?',
    budget: 'Budget range',
    budgetPlaceholder: 'Select a range',
    budgetOptions: {
      '<10m': 'Under Rp 10M',
      '10-50m': 'Rp 10M - 50M',
      '50-200m': 'Rp 50M - 200M',
      '200m+': 'Above Rp 200M',
      undecided: 'Not decided yet',
    },
    submit: 'Transmit brief',
    submitting: 'Sending…',
    successTitle: 'Brief received',
    successBody: 'Logged. A reply follows within two working days.',
    errorTitle: 'Could not send',
    errorBody: 'Something went wrong. Try again, or email us directly.',
    rateLimited: 'Too many submissions. Please wait a few minutes before trying again.',
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Enter a valid email address',
    tooShort: 'Too short',
    tooLong: 'Too long',
  },

  footer: {
    tagline: 'Identity. Dimension. Digital ecosystems.',
    navigation: 'Navigation',
    connect: 'Connect',
    rights: 'All rights reserved',
    endOfDocument: 'End of document',
  },
};

/**
 * Deliberately NOT `as const`.
 *
 * With `as const` every value becomes a string literal type, so `id.ts` would be
 * required to contain the English text verbatim - the exact opposite of what we
 * want. Without it, values widen to `string` while the key structure stays
 * enforced, which is the completeness check we actually need.
 */
export type Dictionary = typeof en;
