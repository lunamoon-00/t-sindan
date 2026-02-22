/**
 * /api/narrative - 判定済みデータの文章化API
 * POST のみ対応。判定ロジックは実行しない。template_only でテンプレートベース生成。
 * 失敗しても呼び出し側は score 結果だけで表示継続できる設計。
 */

import { NextRequest } from 'next/server';
import { NarrativeRequestSchema } from '@/lib/schemas';
import { jsonError } from '@/lib/api-utils';
import { buildNarrativeTemplate } from '@/lib/narrative';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NarrativeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        `入力が不正です: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    const req = parsed.data;

    if (!req.generation_rules.template_only) {
      return jsonError(
        '現在は template_only のみ対応しています',
        400,
        'UNSUPPORTED_MODE'
      );
    }

    const result = buildNarrativeTemplate(req);

    return Response.json(result);
  } catch (e) {
    console.error('[api/narrative]', e);
    return jsonError(
      'ナラティブ生成に失敗しました。スコア結果のみで表示を継続してください。',
      500,
      'NARRATIVE_ERROR'
    );
  }
}
