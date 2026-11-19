# Smart Savings Insights

## Purpose

Help Pennywise users understand discretionary spending patterns and find realistic ways to save. The feature analyzes transactions already in the user's budget and turns them into clear, explainable observations and optional savings ideas.

The feature must be supportive, not judgmental. It must distinguish discretionary spending from essential expenses and never label a purchase as waste solely because of its category.

## Core experience

Add a **Savings Insights** area to the app with:

- A monthly spending breakdown by category and merchant.
- A comparison with the user's previous months.
- Detection of recurring charges and subscriptions.
- Spending-pattern observations such as frequent dining out, gaming purchases, delivery fees, entertainment, and impulse shopping.
- Personalized savings suggestions with estimated monthly and annual savings.
- A savings simulator where the user can choose a realistic reduction (for example, dining out 20% less) and see the effect on their available money.
- A dismiss / not relevant action so users can correct the system's assumptions.

## Categories to examine

Initial discretionary categories should include:

- Restaurants, takeout, coffee shops, food delivery.
- Video games, gaming platforms, in-game purchases, gaming subscriptions.
- Streaming and entertainment subscriptions.
- Shopping and non-essential retail.
- Convenience purchases and delivery fees.
- Entertainment, hobbies, and leisure.

Categories must be configurable. A user may mark a category or merchant as essential, discretionary, shared, business-related, or excluded from analysis. Transfers, credit-card payments, refunds, reimbursements, and duplicate transactions must not be counted as spending.

## Insight logic

Use transaction history and the user's own budget as the primary source of truth.

1. Normalize merchant names and map transactions to categories, retaining the original description.
2. Calculate category and merchant totals for the selected period.
3. Compare against the previous month and, when enough history exists, a rolling three-month average.
4. Detect frequency as well as total spend. For example, many small game purchases may be more revealing than one large purchase.
5. Detect recurring charges by matching merchant, amount range, and billing cadence. Mark these as suspected recurring charges until confirmed.
6. Avoid strong conclusions with insufficient data. Show the period and number of transactions behind each insight.
7. Account for refunds and reversals. Do not infer a user's income, financial distress, or personal circumstances from a single category.

Suggested initial thresholds (make configurable and validate in testing):
- At least 3 transactions in a category before describing a repeated pattern.
- At least 2 comparable periods before describing a trend.
- Flag a category for review when it rises materially above the user's own baseline, not simply because it exceeds a generic spending limit.
- Never call a category "waste" or "bad spending". Use terms such as "flexible spending", "pattern to review", and "possible savings".

## Suggestion examples

Suggestions should be specific, explain their calculation, and remain optional:

- "You spent BSD $180 on restaurants this month across 9 visits. If you reduced that by 20%, you could keep about BSD $36 this month."
- "We found 3 possible gaming or entertainment subscriptions totaling BSD $42/month. Review them to confirm which you still use."
- "Gaming purchases were BSD $65 this month, compared with your recent average of BSD $28. Was this a one-off month?"
- "You made 12 coffee-shop purchases totaling BSD $54. Bringing that to 8 visits could save approximately BSD $18."

These are illustrative examples only. Real suggestions must use the user's actual imported transactions and selected currency.

## Savings simulator

Allow the user to select a category and model:
- A target percentage reduction.
- A target monthly amount.
- A target number of visits or purchases.

Show estimated monthly and annual savings, clearly labeled as estimates. Do not change budgets, transactions, or account balances automatically. Let the user optionally create a savings goal or budget target after reviewing the suggestion.

## UX and controls

Each insight should show:
- A plain-language title.
- The observed amount and date range.
- The transaction count or supporting evidence.
- Comparison baseline, when available.
- A realistic savings estimate and how it was calculated.
- Actions: "Try this saving", "Not relevant", and "Exclude merchant/category".

Provide filters for month, account, category, and currency. Support BSD and USD separately; do not combine currencies without an explicit exchange-rate conversion and clear display of the rate/date.

## Privacy and safety

- Analyze locally stored budget data wherever possible.
- Do not upload transaction histories to an external AI service by default.
- Use deterministic calculations for totals, comparisons, and savings estimates. AI may help phrase explanations, but must not invent amounts or financial facts.
- Do not shame users, diagnose financial problems, or imply that discretionary spending is inherently irresponsible.
- Never cancel subscriptions, move money, or change budgets without explicit user confirmation.
- Keep the feature useful with manually imported PDF, screenshot, CSV, OFX, and QFX transactions.

## Acceptance criteria

- A user can see their top discretionary categories and merchants for a selected month.
- A user can see whether spending is above or below their own baseline when sufficient history exists.
- Dining out and gaming spend can be surfaced independently.
- Each savings estimate can be traced to actual transactions and a visible calculation.
- Users can exclude a merchant/category or mark it essential.
- Duplicate transactions, transfers, refunds, and credit-card payments do not inflate discretionary spending.
- BSD and USD remain distinct unless an explicit conversion is applied.
- Insights are labeled as estimates and never change the budget automatically.

## Suggested implementation phases

1. Build deterministic category/merchant aggregation and spending comparison.
2. Add the Savings Insights screen and explainable insight cards.
3. Add recurring-charge detection and user corrections.
4. Add the savings simulator and optional budget-goal handoff.
5. Add optional AI-generated plain-language explanations, with local deterministic calculations remaining authoritative.
