export interface TechStack {
  node?: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  python?: string[];
}

export interface ErrorContext {
  message: string;
  line: number;
  snippet: string;
}

export interface DebugContext {
  techStack: TechStack;
  projectGoal: string;
  directoryStructure: string[];
  moduleInteractions: string[];
  errorContext: ErrorContext | string;
  recentChanges: string;
  environment: {
    runtime: string;
    docker?: boolean;
  };
  runtimeErrorContext?: {
    logFileErrors: string[];
    stderrOutput?: string;
  };
}
