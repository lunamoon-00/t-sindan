/**
 * /api/score - ルールベース採点API
 * POST のみ対応。AIは使用しない。
 */

import { NextRequest } from 'next/server';
import { ScoreRequestSchema } from '@/lib/schemas';
import { jsonError } from '@/lib/api-utils';
import {
  normalizeAnswers,
  scoreAnswers,
  rankTypes,
  getConfidenceLevel,
  buildReasonSummary,
  buildResultPayload,
} from '@/lib/score';
import type { ScoreResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ScoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        `入力が不正です: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    const { answers } = parsed.data;

    const normalized = normalizeAnswers(answers);
    if (Object.keys(normalized).length < 1) {
      return jsonError('有効な回答が1件以上必要です', 400, 'INVALID_ANSWERS');
    }

    const raw_scores = scoreAnswers(normalized);
    const { first: top_type_id, second: second_type_id } = rankTypes(raw_scores);
    const confidence_level = getConfidenceLevel(raw_scores, top_type_id, second_type_id);
    const { top_reasons, caution_tag } = buildReasonSummary(normalized);
    const result_payload = buildResultPayload(
      top_type_id,
      second_type_id,
      raw_scores,
      confidence_level,
      top_reasons,
      caution_tag
    );

    const response: ScoreResponse = {
      ok: true,
      top_type_id,
      second_type_id,
      confidence_level,
      reason_summary: { top_reasons, caution_tag: caution_tag ?? undefined },
      result_payload,
    };

    return Response.json(response);
  } catch (e) {
    console.error('[api/score]', e);
    return jsonError('サーバーエラーが発生しました', 500, 'INTERNAL_ERROR');
  }
}
