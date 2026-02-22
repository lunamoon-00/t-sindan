/**
 * ルール/マスタ定義（MVP用仮データ）
 */

import type { TypeId } from './types';

// --- 型プロファイル ---
export const TYPE_PROFILES: Record<TypeId, {
  label: string;
  description: string;
  search_keywords: string[];
  exclude_keywords: string[];
  first_step_hint: string;
}> = {
  type_01: {
    label: '受信・案内型',
    description: '電話やメールの受付、窓口案内など、受動的な対応が中心の仕事です。',
    search_keywords: ['受付', '窓口', 'コールセンター', '案内', 'カスタマーサポート'],
    exclude_keywords: ['営業', '開発', '設計'],
    first_step_hint: 'まずは「受付」「窓口」などの求人を検索してみましょう。',
  },
  type_02: {
    label: 'コツコツ入力・更新型',
    description: 'データ入力、書類整理、在庫管理など、ルーティン作業が中心の仕事です。',
    search_keywords: ['データ入力', '事務', '在庫管理', '書類整理', '入力業務'],
    exclude_keywords: ['営業', '接客', '外回り'],
    first_step_hint: '「データ入力」「事務」などのキーワードで探してみてください。',
  },
  type_03: {
    label: '手順事務・調整対応型',
    description: '手順に沿った事務や、関係者間の調整など、段取りが重要な仕事です。',
    search_keywords: ['事務', '調整', '窓口', '経理補助', 'アシスタント'],
    exclude_keywords: ['営業', '開発'],
    first_step_hint: '「事務」「調整」といったキーワードで検索してみましょう。',
  },
};

// --- reason_tag → 表示ラベル辞書（MVP版）---
export const REASON_LABELS: Record<string, string> = {
  prefer_quiet: '静かな環境での作業が向いている傾向があります',
  prefer_routine: '決まった手順で進める作業が合う可能性があります',
  prefer_limited_contact: '限定的な対人接触の方が負担が少ない傾向があります',
  prefer_structure: '明確なルールや手順がある仕事が向いている可能性があります',
  prefer_data_entry: 'コツコツ入力する作業が合う傾向があります',
  prefer_adjustment: '段取りや調整が活かせる可能性があります',
  prefer_reception: '受付や案内の業務が合う傾向があります',
  // negative寄り（caution判定用）
  uneasy_multitask: '複数タスクの同時進行は負担になる可能性があります',
  uneasy_high_pressure: '高いプレッシャー下では負担になる傾向があります',
};

// --- 採点ルール: 質問ID → 回答(A/B/C) → 型ID → スコア加算 ---
export type ScoringRule = {
  [K in 'A' | 'B' | 'C']?: Partial<Record<TypeId, number>>;
};

export const SCORING_RULES: Record<string, ScoringRule> = {
  Q01: {
    A: { type_01: 2, type_02: 0, type_03: 1 },
    B: { type_01: 0, type_02: 2, type_03: 1 },
    C: { type_01: 1, type_02: 1, type_03: 2 },
  },
  Q02: {
    A: { type_01: 2, type_02: 1, type_03: 0 },
    B: { type_01: 0, type_02: 2, type_03: 1 },
    C: { type_01: 1, type_02: 0, type_03: 2 },
  },
  Q03: {
    A: { type_01: 1, type_02: 2, type_03: 0 },
    B: { type_01: 2, type_02: 0, type_03: 1 },
    C: { type_01: 0, type_02: 1, type_03: 2 },
  },
  Q04: {
    A: { type_01: 2, type_02: 0, type_03: 1 },
    B: { type_01: 0, type_02: 2, type_03: 1 },
    C: { type_01: 1, type_02: 1, type_03: 2 },
  },
  Q05: {
    A: { type_01: 0, type_02: 2, type_03: 1 },
    B: { type_01: 2, type_02: 0, type_03: 1 },
    C: { type_01: 1, type_02: 1, type_03: 2 },
  },
  Q06: {
    A: { type_01: 1, type_02: 2, type_03: 0 },
    B: { type_01: 2, type_02: 0, type_03: 1 },
    C: { type_01: 0, type_02: 1, type_03: 2 },
  },
  Q07: {
    A: { type_01: 2, type_02: 1, type_03: 0 },
    B: { type_01: 0, type_02: 2, type_03: 1 },
    C: { type_01: 1, type_02: 0, type_03: 2 },
  },
  Q08: {
    A: { type_01: 0, type_02: 2, type_03: 1 },
    B: { type_01: 2, type_02: 0, type_03: 1 },
    C: { type_01: 1, type_02: 1, type_03: 2 },
  },
};

// --- reason_tag 採点: 質問ID → 回答 → reason_tag ---
export const REASON_TAGS_BY_QUESTION: Record<string, Record<string, string>> = {
  Q01: { A: 'prefer_reception', B: 'prefer_data_entry', C: 'prefer_adjustment' },
  Q02: { A: 'prefer_limited_contact', B: 'prefer_routine', C: 'prefer_structure' },
  Q03: { A: 'prefer_data_entry', B: 'prefer_reception', C: 'prefer_adjustment' },
  Q04: { A: 'prefer_quiet', B: 'prefer_routine', C: 'prefer_structure' },
  Q05: { A: 'prefer_routine', B: 'prefer_reception', C: 'prefer_adjustment' },
  Q06: { A: 'prefer_data_entry', B: 'prefer_limited_contact', C: 'prefer_adjustment' },
  Q07: { A: 'prefer_reception', B: 'prefer_routine', C: 'prefer_structure' },
  Q08: { A: 'prefer_routine', B: 'prefer_reception', C: 'prefer_adjustment' },
};

// --- negative寄りタグ（caution判定用、最大1件）---
export const NEGATIVE_REASON_TAGS: string[] = [
  'uneasy_multitask',
  'uneasy_high_pressure',
];
