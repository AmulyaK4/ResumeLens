export interface ResumeSection {
  name: string;
  score: number;
  status: 'good' | 'needs_improvement' | 'critical';
  issues: string[];
  suggestions: string[];
  rewrite_example?: string;
}

export interface ResumeAnalysis {
  ats_score: number;
  overall_impression: string;
  strengths: string[];
  sections: ResumeSection[];
  keywords_missing: string[];
  quick_wins: string[];
  formatting_notes: string[];
}

export interface AnalysisResponse {
  success: boolean;
  data: ResumeAnalysis;
  error?: string;
}
