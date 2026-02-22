/**
 * API共通ユーティリティ
 */

/** 統一エラーJSONレスポンス */
export function jsonError(message: string, status: number, code?: string) {
  return Response.json(
    {
      ok: false as const,
      error: message,
      ...(code && { code }),
    },
    { status }
  );
}
