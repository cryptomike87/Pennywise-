import type { CategoryEntity, PayeeEntity, TransactionEntity } from '@actual-app/core/types/models';

export type SavingsCategory = 'dining' | 'gaming' | 'subscriptions';

export type SavingsInsight = {
  key: SavingsCategory;
  title: string;
  amount: number;
  previousAmount: number;
  transactionCount: number;
  estimatedMonthlySavings: number;
  changePercent: number | null;
  examples: string[];
};

const CATEGORY_KEYWORDS: Record<SavingsCategory, RegExp> = {
  dining: /restaurant|eat(?:ing)? out|take.?out|takeaway|food delivery|coffee|cafe|fast food|dining/i,
  gaming: /game|gaming|video game|playstation|xbox|steam|nintendo|twitch|epic games/i,
  subscriptions: /subscription|streaming|netflix|spotify|disney\+?|hulu|prime video|youtube premium|icloud|google one/i,
};

function classify(text: string): SavingsCategory | null {
  for (const [key, pattern] of Object.entries(CATEGORY_KEYWORDS)) {
    if (pattern.test(text)) return key as SavingsCategory;
  }
  return null;
}

export function buildSavingsInsights({
  transactions,
  categories,
  payees,
  currentMonth,
  reductionPercent = 20,
}: {
  transactions: readonly TransactionEntity[];
  categories: readonly CategoryEntity[];
  payees: readonly PayeeEntity[];
  currentMonth: string;
  reductionPercent?: number;
}): SavingsInsight[] {
  const categoryNames = new Map(categories.map(category => [category.id, category.name]));
  const payeeNames = new Map(payees.map(payee => [payee.id, payee.name]));
  const previousMonth = (() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  })();

  const totals = new Map<SavingsCategory, { current: number; previous: number; count: number; examples: Set<string> }>();
  for (const key of Object.keys(CATEGORY_KEYWORDS) as SavingsCategory[]) {
    totals.set(key, { current: 0, previous: 0, count: 0, examples: new Set() });
  }

  for (const transaction of transactions) {
    if (
      transaction.tombstone ||
      transaction._deleted ||
      transaction.transfer_id ||
      transaction.starting_balance_flag ||
      transaction.parent_id ||
      transaction.is_parent ||
      transaction.is_child ||
      transaction.amount >= 0 ||
      !transaction.date
    ) {
      continue;
    }

    const categoryName = transaction.category
      ? categoryNames.get(transaction.category) ?? ''
      : '';
    const payeeName = transaction.payee
      ? payeeNames.get(transaction.payee) ?? ''
      : '';
    const text = `${categoryName} ${payeeName} ${transaction.imported_payee ?? ''} ${transaction.notes ?? ''}`;
    const key = classify(text);
    if (!key) continue;

    const month = transaction.date.slice(0, 7);
    const entry = totals.get(key)!;
    const amount = Math.abs(transaction.amount);
    if (month === currentMonth) {
      entry.current += amount;
      entry.count += 1;
      if (payeeName) entry.examples.add(payeeName);
    } else if (month === previousMonth) {
      entry.previous += amount;
    }
  }

  const labels: Record<SavingsCategory, string> = {
    dining: 'Eating out',
    gaming: 'Gaming',
    subscriptions: 'Subscriptions',
  };

  return (Object.keys(labels) as SavingsCategory[])
    .map(key => {
      const entry = totals.get(key)!;
      return {
        key,
        title: labels[key],
        amount: entry.current,
        previousAmount: entry.previous,
        transactionCount: entry.count,
        estimatedMonthlySavings: Math.round(entry.current * reductionPercent / 100),
        changePercent:
          entry.previous > 0
            ? Math.round(((entry.current - entry.previous) / entry.previous) * 100)
            : null,
        examples: [...entry.examples].slice(0, 3),
      };
    })
    .filter(insight => insight.transactionCount >= 2 && insight.amount > 0)
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings);
}
