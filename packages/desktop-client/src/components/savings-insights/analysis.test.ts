import type { CategoryEntity, PayeeEntity, TransactionEntity } from '@actual-app/core/types/models';

import { buildSavingsInsights } from './analysis';

const categories = [
  { id: 'food', name: 'Eating Out' },
  { id: 'fun', name: 'Entertainment' },
] as CategoryEntity[];
const payees = [
  { id: 'restaurant', name: 'Harbour Cafe' },
  { id: 'steam', name: 'Steam Games' },
] as PayeeEntity[];

function tx(
  id: string,
  date: string,
  amount: number,
  category: string,
  payee: string,
  extra: Partial<TransactionEntity> = {},
) {
  return {
    id,
    date,
    amount,
    category,
    payee,
    account: 'checking',
    ...extra,
  } as TransactionEntity;
}

describe('buildSavingsInsights', () => {
  it('groups dining and gaming purchases and calculates optional savings', () => {
    const insights = buildSavingsInsights({
      transactions: [
        tx('1', '2026-11-02', -3500, 'food', 'restaurant'),
        tx('2', '2026-11-08', -4200, 'food', 'restaurant'),
        tx('3', '2026-11-09', -2000, 'fun', 'steam'),
        tx('4', '2026-11-10', -1500, 'fun', 'steam'),
        tx('5', '2026-10-03', -5000, 'food', 'restaurant'),
      ],
      categories,
      payees,
      currentMonth: '2026-11',
      reductionPercent: 20,
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'dining',
          amount: 7700,
          previousAmount: 5000,
          transactionCount: 2,
          estimatedMonthlySavings: 1540,
          changePercent: 54,
        }),
        expect.objectContaining({
          key: 'gaming',
          amount: 3500,
          transactionCount: 2,
          estimatedMonthlySavings: 700,
        }),
      ]),
    );
  });

  it('ignores transfers, refunds, split children and deleted transactions', () => {
    const insights = buildSavingsInsights({
      transactions: [
        tx('1', '2026-11-02', -3500, 'food', 'restaurant'),
        tx('2', '2026-11-08', -4200, 'food', 'restaurant', {
          transfer_id: 'other',
        }),
        tx('3', '2026-11-09', 2000, 'food', 'restaurant'),
        tx('4', '2026-11-10', -1500, 'food', 'restaurant', {
          parent_id: 'parent',
        }),
        tx('5', '2026-11-11', -1200, 'food', 'restaurant', {
          _deleted: true,
        }),
      ],
      categories,
      payees,
      currentMonth: '2026-11',
    });

    expect(insights).toHaveLength(0);
  });

  it('does not claim a trend when there is no previous-month baseline', () => {
    const insights = buildSavingsInsights({
      transactions: [
        tx('1', '2026-11-02', -3500, 'food', 'restaurant'),
        tx('2', '2026-11-08', -4200, 'food', 'restaurant'),
      ],
      categories,
      payees,
      currentMonth: '2026-11',
    });

    expect(insights[0].changePercent).toBeNull();
  });
});
