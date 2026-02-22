/**
 * 採点ロジック（pure function）
 */

import type {
  AnswersMap,
  QuestionId,
  TypeId,
  ConfidenceLevel,
  ResultCore,
  ResultPayload,
  ReasonSummary,
  TopReason,
  TypeProfile,
} from './types';
import { TYPE_PROFILES, SCORING_RULES, REASON_TAGS_BY_QUESTION, REASON_LABELS, NEGATIVE_REASON_TAGS } from './rules';

const QUESTION_IDS: QuestionId[] = ['Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08'];
const TYPE_IDS: TypeId[] = ['type_01', 'type_02', 'type_03'];

/** 回答を正規化（空・不正値はスキップ） */
export function normalizeAnswers(answers: AnswersMap): Partial<Record<QuestionId, 'A' | 'B' | 'C'>> {
  const normalized: Partial<Record<QuestionId, 'A' | 'B' | 'C'>> = {};
  for (const q of QUESTION_IDS) {
    const v = answers[q];
    if (v === 'A' || v === 'B' || v === 'C') {
      normalized[q] = v;
    }
  }
  return normalized;
}

/** ルールベースで採点 */
export function scoreAnswers(normalized: Partial<Record<QuestionId, 'A' | 'B' | 'C'>>): Record<TypeId, number> {
  const scores: Record<TypeId, number> = {
    type_01: 0,
    type_02: 0,
    type_03: 0,
  };
  for (const q of QUESTION_IDS) {
    const ans = normalized[q];
    if (!ans) continue;
    const rule = SCORING_RULES[q]?.[ans];
    if (!rule) continue;
    for (const tid of TYPE_IDS) {
      scores[tid] += rule[tid] ?? 0;
    }
  }
  return scores;
}

/** スコアから型ランキングを算出（1位、2位） */
export function rankTypes(scores: Record<TypeId, number>): { first: TypeId; second: TypeId | null } {
  const sorted = [...TYPE_IDS].sort((a, b) => scores[b] - scores[a]);
  const first = sorted[0];
  const second = sorted[1] && scores[sorted[1]] > 0 ? sorted[1] : null;
  return { first, second };
}

/** 信頼度判定 */
export function getConfidenceLevel(
  scores: Record<TypeId, number>,
  first: TypeId,
  second: TypeId | null
): ConfidenceLevel {
  const diff = second ? scores[first] - scores[second] : scores[first];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total < 4) return 'low';
  if (diff >= 4) return 'high';
  if (diff >= 2) return 'medium';
  return 'low';
}

/** reason_tag → ラベルに変換（未対応はスキップ） */
function getReasonLabel(reason_tag: string): string | null {
  const label = REASON_LABELS[reason_tag];
  return label ?? null;
}

/** reason_summary を構築（最大3件、negative寄りはcaution用に別管理） */
export function buildReasonSummary(
  normalized: Partial<Record<QuestionId, 'A' | 'B' | 'C'>>
): { top_reasons: TopReason[]; caution_tag: string | null } {
  const reasonWeights: Record<string, number> = {};
  let caution_tag: string | null = null;

  for (const q of QUESTION_IDS) {
    const ans = normalized[q];
    if (!ans) continue;
    const tag = REASON_TAGS_BY_QUESTION[q]?.[ans];
    if (!tag) continue;

    if (NEGATIVE_REASON_TAGS.includes(tag)) {
      if (!caution_tag) caution_tag = tag;
    } else {
      reasonWeights[tag] = (reasonWeights[tag] ?? 0) + 1;
    }
  }

  const topReasons: TopReason[] = [];
  const sorted = Object.entries(reasonWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  for (const [tag, weight] of sorted) {
    const label = getReasonLabel(tag);
    if (label) {
      topReasons.push({ reason_tag: tag, label, weight });
    }
  }

  return { top_reasons: topReasons, caution_tag };
}

/** type_profile を構築 */
export function getTypeProfile(type_id: TypeId): TypeProfile {
  const p = TYPE_PROFILES[type_id];
  return {
    type_id,
    label: p.label,
    description: p.description,
    search_keywords: p.search_keywords,
    exclude_keywords: p.exclude_keywords,
    first_step_hint: p.first_step_hint,
  };
}

/** result_payload を構築 */
export function buildResultPayload(
  top_type_id: TypeId,
  second_type_id: TypeId | null,
  raw_scores: Record<TypeId, number>,
  confidence_level: ConfidenceLevel,
  top_reasons: TopReason[],
  caution_tag: string | null
): ResultPayload {
  const type_profile = getTypeProfile(top_type_id);
  const reason_summary = { top_reasons, caution_tag: caution_tag || undefined };
  const result_core: ResultCore = {
    top_type_id,
    second_type_id,
    confidence_level,
    raw_scores,
  };
  return {
    result_core,
    type_profile,
    reason_summary,
  };
}
