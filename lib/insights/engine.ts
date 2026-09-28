import { formatCurrency, formatPercent, CurrencyCode } from "../utils";

export interface InsightItem {
  id: string;
  type: "warning" | "danger" | "success" | "info";
  title: string;
  description: string;
  metric?: string;
  actionText?: string;
  actionUrl?: string;
}

export interface ClientInsightData {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number | null;
  classification: string;
  priorRevenue?: number;
  priorProfit?: number;
  priorMarginPercent?: number | null;
  priorClassification?: string;
}

export function generateInsights(
  clients: ClientInsightData[],
  totalRevenue: number,
  totalProfit: number,
  currencyCode?: CurrencyCode
): InsightItem[] {
  const insights: InsightItem[] = [];

  if (!clients || clients.length === 0 || totalRevenue === 0) {
    return [
      {
        id: "no-data",
        type: "info",
        title: "No data available",
        description: "Upload your sales and cost data to generate client profitability insights.",
      },
    ];
  }

  // 1. Loss-making clients check
  const lossMakers = clients.filter((c) => c.classification === "loss_making" && c.profit < 0);
  if (lossMakers.length > 0) {
    const totalLossAmount = Math.abs(lossMakers.reduce((acc, c) => acc + c.profit, 0));
    const worstClient = [...lossMakers].sort((a, b) => a.profit - b.profit)[0];

    insights.push({
      id: "loss-makers-alert",
      type: "danger",
      title: `${lossMakers.length} ${lossMakers.length === 1 ? "Client is" : "Clients are"} Loss-Making`,
      description: `${lossMakers.length} active ${lossMakers.length === 1 ? "account is" : "accounts are"} eroding profits by ${formatCurrency(
        totalLossAmount,
        false,
        currencyCode
      )}. Worst performing account is ${worstClient.name} (${formatCurrency(worstClient.profit, false, currencyCode)} gross profit).`,
      metric: `-${formatCurrency(totalLossAmount, false, currencyCode)}`,
      actionText: "Review loss makers",
      actionUrl: "/clients?status=loss_making",
    });
  }

  // 2. High revenue but low-margin clients (Price renegotiation opportunity)
  const highRevLowMargin = clients
    .filter((c) => c.classification === "low_margin" && c.revenue > totalRevenue * 0.05)
    .sort((a, b) => b.revenue - a.revenue);

  if (highRevLowMargin.length > 0) {
    const topLow = highRevLowMargin[0];
    insights.push({
      id: "low-margin-opportunity",
      type: "warning",
      title: `Low Margin on High-Volume Client: ${topLow.name}`,
      description: `${topLow.name} drives ${formatCurrency(
        topLow.revenue,
        false,
        currencyCode
      )} in revenue (${formatPercent((topLow.revenue / totalRevenue) * 100)} of company total), but yields only ${formatPercent(
        topLow.marginPercent
      )} gross margin. Consider a 5-10% rate revision or reducing high-cost service tier.`,
      metric: formatPercent(topLow.marginPercent),
      actionText: "View client drill-down",
      actionUrl: `/clients/${topLow.id}`,
    });
  }

  // 3. Profit concentration risk (Top 5 clients)
  if (totalProfit > 0 && clients.length >= 5) {
    const sortedByProfit = [...clients].sort((a, b) => b.profit - a.profit);
    const top5Profit = sortedByProfit.slice(0, 5).reduce((acc, c) => acc + Math.max(0, c.profit), 0);
    const concentrationRatio = (top5Profit / totalProfit) * 100;

    if (concentrationRatio >= 60) {
      insights.push({
        id: "concentration-risk",
        type: "warning",
        title: "High Profit Concentration in Top 5 Clients",
        description: `Your top 5 clients account for ${formatPercent(
          concentrationRatio
        )} of all company gross profit. Losing any single high-tier account could materially impact operating income.`,
        metric: `${concentrationRatio.toFixed(0)}%`,
        actionText: "View clients",
        actionUrl: "/clients?sort=profit_desc",
      });
    }
  }

  // 4. Clients flipped from profitable to loss-making or declining significantly
  const flippedClients = clients.filter(
    (c) =>
      c.priorClassification === "profitable" &&
      (c.classification === "loss_making" || c.classification === "low_margin")
  );

  if (flippedClients.length > 0) {
    const flipped = flippedClients[0];
    insights.push({
      id: `flipped-${flipped.id}`,
      type: "danger",
      title: `Margin Degradation Alert: ${flipped.name}`,
      description: `${flipped.name} fell from Profitable (${formatPercent(
        flipped.priorMarginPercent
      )}) down to ${flipped.classification === "loss_making" ? "Loss-Making" : "Low-Margin"} (${formatPercent(
        flipped.marginPercent
      )}). Service delivery or fulfillment expenses increased disproportionately.`,
      metric: formatPercent(flipped.marginPercent),
      actionText: "Investigate expenses",
      actionUrl: `/clients/${flipped.id}`,
    });
  }

  // 5. Star performer (Highest margin profitable client with meaningful revenue)
  const starClients = clients
    .filter((c) => c.classification === "profitable" && c.revenue > totalRevenue * 0.03 && c.marginPercent !== null)
    .sort((a, b) => (b.marginPercent || 0) - (a.marginPercent || 0));

  if (starClients.length > 0) {
    const star = starClients[0];
    insights.push({
      id: "star-performer",
      type: "success",
      title: `Highest Margin Performer: ${star.name}`,
      description: `${star.name} delivers ${formatPercent(star.marginPercent)} gross margin on ${formatCurrency(
        star.revenue,
        false,
        currencyCode
      )} revenue (${formatCurrency(star.profit, false, currencyCode)} profit). Strong archetype to replicate for sales targeting.`,
      metric: formatPercent(star.marginPercent),
      actionText: "View profile",
      actionUrl: `/clients/${star.id}`,
    });
  }

  return insights.slice(0, 5);
}
