import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import * as monthUtils from '@actual-app/core/shared/months';

import { MobileBackButton } from '#components/mobile/MobileBackButton';
import { Page, PageHeader } from '#components/Page';
import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { usePayees } from '#hooks/usePayees';
import { useTransactions } from '#hooks/useTransactions';

import { buildSavingsInsights } from './analysis';

const REDUCTION_OPTIONS = [10, 20, 30];

export function SavingsInsights() {
  const format = useFormat();
  const categoriesQuery = useCategories();
  const payeesQuery = usePayees();
  const [reductionPercent, setReductionPercent] = useState(20);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const transactionQuery = useMemo(
    () => q('transactions').options({ splits: 'all' }).select('*').orderBy({ date: 'desc' }),
    [],
  );
  const {
    transactions,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTransactions({
    query: transactionQuery,
    options: { pageSize: 500 },
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const currentMonth = monthUtils.currentMonth();
  const insights = useMemo(
    () =>
      buildSavingsInsights({
        transactions,
        categories: categoriesQuery.data?.list ?? [],
        payees: payeesQuery.data ?? [],
        currentMonth,
        reductionPercent,
      }),
    [transactions, categoriesQuery.data, payeesQuery.data, currentMonth, reductionPercent],
  );

  const visibleInsights = insights.filter(insight => !dismissed.includes(insight.key));
  const totalPotentialSavings = visibleInsights.reduce(
    (total, insight) => total + insight.estimatedMonthlySavings,
    0,
  );

  return (
    <Page
      header={
        <PageHeader
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MobileBackButton />
              <Text style={{ fontSize: 25, fontWeight: 600 }}>Savings Insights</Text>
            </View>
          }
        />
      }
    >
      <View style={{ paddingBottom: 28, gap: 18 }}>
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 14, color: theme.pageTextSubdued }}>
            A practical look at flexible spending, based on your own transactions.
          </Text>
          <Text style={{ fontSize: 12, color: theme.pageTextSubdued }}>
            {monthUtils.format(currentMonth, 'MMMM yyyy')} · Estimates, not automatic budget changes
          </Text>
        </View>

        <View
          style={{
            padding: 18,
            borderRadius: 12,
            backgroundColor: theme.cardBackground,
            border: '1px solid ' + theme.pillBorder,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
            Possible monthly savings from the opportunities below
          </Text>
          <Text style={{ fontSize: 30, fontWeight: 700, color: theme.noticeText }}>
            {format(totalPotentialSavings, 'financial')}
          </Text>
          <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
            {format(totalPotentialSavings * 12, 'financial')} if the same reduction continued for a year
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Savings target</Text>
          <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
            Choose how much you would like to reduce these categories. You can change this at any time.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {REDUCTION_OPTIONS.map(value => (
              <Button
                key={value}
                variant={reductionPercent === value ? 'primary' : 'bare'}
                onPress={() => setReductionPercent(value)}
              >
                {value}%
              </Button>
            ))}
          </View>
        </View>

        {isPending || categoriesQuery.isPending || payeesQuery.isPending || isFetchingNextPage ? (
          <Text style={{ color: theme.pageTextSubdued }}>Analyzing your transactions…</Text>
        ) : visibleInsights.length === 0 ? (
          <View
            style={{
              padding: 18,
              borderRadius: 12,
              backgroundColor: theme.cardBackground,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Not enough spending patterns yet</Text>
            <Text style={{ color: theme.pageTextSubdued, fontSize: 13 }}>
              Add or import more transactions, and Pennywise will look for repeated dining, gaming, and subscription spending. We only show a suggestion after at least two matching purchases.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Opportunities to review</Text>
            {visibleInsights.map(insight => (
              <View
                key={insight.key}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: theme.cardBackground,
                  border: '1px solid ' + theme.pillBorder,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600 }}>{insight.title}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: theme.noticeText }}>
                    {format(insight.estimatedMonthlySavings, 'financial')} possible
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
                  You spent {format(insight.amount, 'financial')} across {insight.transactionCount} purchases this month.
                </Text>
                {insight.changePercent !== null && (
                  <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
                    {insight.changePercent >= 0 ? 'Up' : 'Down'} {Math.abs(insight.changePercent)}% compared with last month.
                  </Text>
                )}
                {insight.examples.length > 0 && (
                  <Text style={{ fontSize: 12, color: theme.pageTextSubdued }}>
                    Merchants: {insight.examples.join(', ')}
                  </Text>
                )}
                <Text style={{ fontSize: 13 }}>
                  Reducing this category by {reductionPercent}% could keep {format(insight.estimatedMonthlySavings, 'financial')} in your budget each month.
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Button variant="bare" onPress={() => setDismissed(old => [...old, insight.key])}>
                    Not relevant
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 11, color: theme.pageTextSubdued }}>
          Pennywise uses transaction categories, payee names and descriptions to identify patterns. Transfers, refunds, income, split transactions and deleted entries are excluded. Suggestions are estimates; no transactions or budgets are changed.
        </Text>
      </View>
    </Page>
  );
}
