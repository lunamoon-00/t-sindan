/**
 * ナラティブ生成（template_only MVP）
 * 判定ロジックは使わない。score結果を入力として文章化するだけ。
 */

import type { NarrativeRequest, NarrativeResponse } from './types';
import { REASON_LABELS } from './rules';

/** テンプレートベースでナラティブを生成（AI未使用） */
export function buildNarrativeTemplate(req: NarrativeRequest): NarrativeResponse {
  const { type_profile, reason_summary, result_core } = req;
  const { confidence_level } = result_core;

  const confidencePhrase =
    confidence_level === 'high'
      ? '当てはまる傾向が比較的強い'
      : confidence_level === 'medium'
        ? '当てはまる傾向が見られる'
        : 'あくまで参考程度の傾向';

  const summary_comment = `${type_profile.label}が${confidencePhrase}可能性があります。${type_profile.description}`;

  const reason_bullets = reason_summary.top_reasons
    .slice(0, 3)
    .map((r) => r.label);

  const caution_bullets: string[] = [];
  const caution_tag = reason_summary.caution_tag;
  if (caution_tag) {
    const label = REASON_LABELS[caution_tag];
    if (label) caution_bullets.push(label);
  }

  const next_step_comment = `今週の一歩: ${type_profile.first_step_hint}`;

  return {
    ok: true,
    summary_comment,
    reason_bullets,
    caution_bullets: caution_bullets.slice(0, 1),
    next_step_comment,
  };
}
