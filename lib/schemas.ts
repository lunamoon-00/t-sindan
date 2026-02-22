/**
 * Zod スキーマ（バリデーション用）
 */

import { z } from 'zod';

const AnswerChoiceSchema = z.enum(['A', 'B', 'C']);
const QuestionIdSchema = z.enum(['Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08']);

export const ScoreRequestSchema = z.object({
  answers: z.record(z.string(), AnswerChoiceSchema),
  schema_version: z.string(),
  diagnosis_version: z.string(),
});

const TypeIdSchema = z.enum(['type_01', 'type_02', 'type_03']);
const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

const TopReasonSchema = z.object({
  reason_tag: z.string(),
  label: z.string(),
  weight: z.number(),
});

const ReasonSummarySchema = z.object({
  top_reasons: z.array(TopReasonSchema),
  caution_tag: z.string().nullable().optional(),
});

const TypeProfileSchema = z.object({
  type_id: TypeIdSchema,
  label: z.string(),
  description: z.string(),
  search_keywords: z.array(z.string()),
  exclude_keywords: z.array(z.string()),
  first_step_hint: z.string(),
});

const ResultCoreSchema = z.object({
  top_type_id: TypeIdSchema,
  second_type_id: TypeIdSchema.nullable(),
  confidence_level: ConfidenceLevelSchema,
  raw_scores: z.record(z.string(), z.number()),
});

export const NarrativeRequestSchema = z.object({
  result_core: ResultCoreSchema,
  type_profile: TypeProfileSchema,
  reason_summary: ReasonSummarySchema,
  generation_rules: z.object({
    template_only: z.boolean(),
  }),
});
