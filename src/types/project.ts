/**
 * ProjectSpec - The core data structure representing a complete project specification
 * This type is synchronized between frontend and backend
 */

export type ProjectStackType = 'frontend' | 'backend' | 'fullstack';
export type ArchitectureType = 'monolith' | 'microservices' | 'serverless' | 'event-driven';
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'json';
export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-many';
export type ApiType = 'rest' | 'graphql' | 'none';
export type DeploymentPlatform = 'vercel' | 'netlify' | 'render' | 'flyio' | 'railway' | 'aws';
export type CIProvider = 'github-actions' | 'gitlab-ci' | 'other';
export type DocumentationType = 'swagger' | 'postman' | 'none';
export type ConflictType = 'error' | 'warning';

export interface ProjectField {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  default: any;
}

export interface EntityRelation {
  type: RelationType;
  target: string;
  field: string;
  reverseField: string;
}

export interface Entity {
  name: string;
  description: string;
  fields: ProjectField[];
  relations: EntityRelation[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  entities: string[];
  dependencies: string[];
  settings: Record<string, any>;
}

export interface Endpoint {
  id: string;
  entity: string;
  path: string;
  methods: string[];
  authRequired: boolean;
  description: string;
}

export interface Conflict {
  type: ConflictType;
  code: string;
  message: string;
  suggestion?: string;
}

export interface IntegrityResult {
  conflicts: Conflict[];
  warnings: Conflict[];
  suggestions: Conflict[];
}

export interface TestCase {
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
}

export interface TestsPlan {
  unitTests: TestCase[];
  integrationTests: TestCase[];
  e2eTests: TestCase[];
  manualChecks: TestCase[];
}

export interface ProjectSpec {
  meta: {
    projectName: string;
    summary: string;
    tooling: {
      primaryAI: 'gpt';
      generateAIConfigs: boolean;
    };
  };

  stack: {
    type: ProjectStackType;
    frontend: {
      framework: string;
      language: string;
      libraries: string[];
    };
    backend: {
      framework: string;
      language: string;
      libraries: string[];
    };
    database: {
      type: string | null;
      provider: string | null;
      schemaFormat: 'mermaid';
    };
    architecture: ArchitectureType;
  };

  auth: {
    enabled: boolean;
    methods: string[];
    roles: string[];
    permissions: Record<string, string[]>;
    security: {
      passwordPolicy: string | null;
      rateLimiting: boolean;
      twoFactorAuth: boolean;
    };
  };

  features: Feature[];

  entities: Entity[];

  api: {
    type: ApiType;
    endpoints: Endpoint[];
    documentation: DocumentationType;
  };

  tests: {
    unit: boolean;
    integration: boolean;
    e2e: boolean;
    manualChecklists: boolean;
    frameworks: string[];
  };

  deployment: {
    platform: DeploymentPlatform;
    ci: {
      enabled: boolean;
      provider: CIProvider;
    };
  };

  documentation: {
    readmeFormat: 'full';
    includeInstallGuide: boolean;
    includeApiDocs: boolean;
    includeArchitecture: boolean;
    includeTests: boolean;
  };

  aiFiles: {
    claude: {
      enabled: boolean;
      files: Record<string, string>;
    };
    cursor: {
      enabled: boolean;
      files: Record<string, string>;
    };
    copilot: {
      enabled: boolean;
      agents: string[];
    };
  };

  integrity: IntegrityResult;
}

// Default empty project
export const defaultProject: ProjectSpec = {
  meta: {
    projectName: '',
    summary: '',
    tooling: {
      primaryAI: 'gpt',
      generateAIConfigs: true,
    },
  },
  stack: {
    type: 'fullstack',
    frontend: {
      framework: 'Next.js',
      language: 'TypeScript',
      libraries: [],
    },
    backend: {
      framework: 'Fastify',
      language: 'TypeScript',
      libraries: [],
    },
    database: {
      type: null,
      provider: null,
      schemaFormat: 'mermaid',
    },
    architecture: 'monolith',
  },
  auth: {
    enabled: false,
    methods: [],
    roles: [],
    permissions: {},
    security: {
      passwordPolicy: null,
      rateLimiting: false,
      twoFactorAuth: false,
    },
  },
  features: [],
  entities: [],
  api: {
    type: 'none',
    endpoints: [],
    documentation: 'none',
  },
  tests: {
    unit: true,
    integration: false,
    e2e: false,
    manualChecklists: true,
    frameworks: ['jest'],
  },
  deployment: {
    platform: 'vercel',
    ci: {
      enabled: false,
      provider: 'github-actions',
    },
  },
  documentation: {
    readmeFormat: 'full',
    includeInstallGuide: true,
    includeApiDocs: true,
    includeArchitecture: true,
    includeTests: true,
  },
  aiFiles: {
    claude: {
      enabled: false,
      files: {},
    },
    cursor: {
      enabled: false,
      files: {},
    },
    copilot: {
      enabled: true,
      agents: [],
    },
  },
  integrity: {
    conflicts: [],
    warnings: [],
    suggestions: [],
  },
};
