/**
 * 診断API 型定義
 * 等身大で動ける仕事診断 MVP
 */

// --- 回答選択肢 ---
export type AnswerChoice = 'A' | 'B' | 'C';

// --- 質問ID ---
export type QuestionId = 'Q01' | 'Q02' | 'Q03' | 'Q04' | 'Q05' | 'Q06' | 'Q07' | 'Q08';

// --- 回答マップ ---
export type AnswersMap = Partial<Record<QuestionId, AnswerChoice>>;

// --- 型ID ---
export type TypeId = 'type_01' | 'type_02' | 'type_03';

// --- 信頼度レベル ---
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// --- Score API ---

export interface ScoreRequest {
  answers: AnswersMap;
  schema_version: string;
  diagnosis_version: string;
}

export interface TopReason {
  reason_tag: string;
  label: string;
  weight: number;
}

export interface ReasonSummary {
  top_reasons: TopReason[];
  /** caution判定用（negative寄りタグ、最大1件） */
  caution_tag?: string | null;
}

export interface TypeProfile {
  type_id: TypeId;
  label: string;
  description: string;
  search_keywords: string[];
  exclude_keywords: string[];
  first_step_hint: string;
}

export interface ResultCore {
  top_type_id: TypeId;
  second_type_id: TypeId | null;
  confidence_level: ConfidenceLevel;
  raw_scores: Record<TypeId, number>;
}

export interface ResultPayload {
  result_core: ResultCore;
  type_profile: TypeProfile;
  reason_summary: ReasonSummary;
}

export interface ScoreResponse {
  ok: true;
  top_type_id: TypeId;
  second_type_id: TypeId | null;
  confidence_level: ConfidenceLevel;
  reason_summary: ReasonSummary;
  result_payload: ResultPayload;
}

// --- Narrative API ---

export interface GenerationRules {
  template_only: boolean;
}

export interface NarrativeRequest {
  result_core: ResultCore;
  type_profile: TypeProfile;
  reason_summary: ReasonSummary;
  generation_rules: GenerationRules;
}

export interface NarrativeResponse {
  ok: true;
  summary_comment: string;
  reason_bullets: string[];
  caution_bullets: string[];
  next_step_comment: string;
}

// --- エラー ---

export interface ApiErrorResponse {
  ok: false;
  error: string;
  code?: string;
}
