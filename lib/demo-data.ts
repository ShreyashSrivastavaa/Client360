import { prisma } from "./db";
import { recalculateClientSummaries } from "./calculations/engine";

interface DemoClientConfig {
  name: string;
  extRef: string;
  monthlyRevenueBase: number;
  monthlyCostBase: number;
  revenueVariance: number;
  costVariance: number;
  costCategories: { category: string; share: number }[];
  expectedType: "profitable" | "low_margin" | "loss_making";
}

const DEMO_CLIENTS: DemoClientConfig[] = [
  // Profitable Clients (>20% margin)
  {
    name: "CloudScale Tech",
    extRef: "CLI-1001",
    monthlyRevenueBase: 42000,
    monthlyCostBase: 16500,
    revenueVariance: 0.08,
    costVariance: 0.05,
    costCategories: [
      { category: "Cloud Infrastructure", share: 0.5 },
      { category: "Customer Support", share: 0.25 },
      { category: "Account Management", share: 0.25 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Lumina AI Labs",
    extRef: "CLI-1002",
    monthlyRevenueBase: 38500,
    monthlyCostBase: 14200,
    revenueVariance: 0.12,
    costVariance: 0.06,
    costCategories: [
      { category: "GPU Compute", share: 0.6 },
      { category: "Technical Support", share: 0.2 },
      { category: "Onboarding & Ops", share: 0.2 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Apex Dynamics",
    extRef: "CLI-1003",
    monthlyRevenueBase: 55000,
    monthlyCostBase: 26000,
    revenueVariance: 0.05,
    costVariance: 0.04,
    costCategories: [
      { category: "Implementation", share: 0.4 },
      { category: "Dedicated Infrastructure", share: 0.35 },
      { category: "Account Management", share: 0.25 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Horizon Financial",
    extRef: "CLI-1004",
    monthlyRevenueBase: 32000,
    monthlyCostBase: 17500,
    revenueVariance: 0.06,
    costVariance: 0.05,
    costCategories: [
      { category: "Compliance & Security", share: 0.45 },
      { category: "Cloud Hosting", share: 0.35 },
      { category: "Support Tier 1", share: 0.2 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Sterling Media Group",
    extRef: "CLI-1005",
    monthlyRevenueBase: 28000,
    monthlyCostBase: 11500,
    revenueVariance: 0.1,
    costVariance: 0.04,
    costCategories: [
      { category: "CDN & Bandwidth", share: 0.55 },
      { category: "Support Services", share: 0.25 },
      { category: "License Fees", share: 0.2 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Vortex Aerospace",
    extRef: "CLI-1006",
    monthlyRevenueBase: 68000,
    monthlyCostBase: 41000,
    revenueVariance: 0.07,
    costVariance: 0.05,
    costCategories: [
      { category: "Engineering Labor", share: 0.6 },
      { category: "Security Auditing", share: 0.25 },
      { category: "Infrastructure", share: 0.15 },
    ],
    expectedType: "profitable",
  },
  {
    name: "OmniHealth Solutions",
    extRef: "CLI-1007",
    monthlyRevenueBase: 24000,
    monthlyCostBase: 15200,
    revenueVariance: 0.04,
    costVariance: 0.05,
    costCategories: [
      { category: "HIPAA Cloud Vault", share: 0.5 },
      { category: "Support Desk", share: 0.3 },
      { category: "Implementation", share: 0.2 },
    ],
    expectedType: "profitable",
  },
  {
    name: "Beacon Logistics",
    extRef: "CLI-1008",
    monthlyRevenueBase: 29500,
    monthlyCostBase: 17200,
    revenueVariance: 0.08,
    costVariance: 0.06,
    costCategories: [
      { category: "API Telemetry", share: 0.45 },
      { category: "Account Management", share: 0.3 },
      { category: "Support", share: 0.25 },
    ],
    expectedType: "profitable",
  },

  // Low-Margin Clients (5% - 19.9%)
  {
    name: "Global Retail Partners",
    extRef: "CLI-1009",
    monthlyRevenueBase: 84000,
    monthlyCostBase: 76500, // ~9% margin, massive volume
    revenueVariance: 0.04,
    costVariance: 0.03,
    costCategories: [
      { category: "High Volume Discounts", share: 0.4 },
      { category: "Dedicated TAM Team", share: 0.35 },
      { category: "Server Infrastructure", share: 0.25 },
    ],
    expectedType: "low_margin",
  },
  {
    name: "Titan Manufacturing",
    extRef: "CLI-1010",
    monthlyRevenueBase: 46000,
    monthlyCostBase: 39500, // ~14% margin
    revenueVariance: 0.05,
    costVariance: 0.05,
    costCategories: [
      { category: "On-Site Support", share: 0.45 },
      { category: "Legacy Integrations", share: 0.35 },
      { category: "Software Hosting", share: 0.2 },
    ],
    expectedType: "low_margin",
  },
  {
    name: "Swift Courier Network",
    extRef: "CLI-1011",
    monthlyRevenueBase: 33000,
    monthlyCostBase: 29000, // ~12% margin
    revenueVariance: 0.07,
    costVariance: 0.04,
    costCategories: [
      { category: "SMS Gateway Fees", share: 0.5 },
      { category: "Support Labor", share: 0.3 },
      { category: "Account Management", share: 0.2 },
    ],
    expectedType: "low_margin",
  },
  {
    name: "Pulse Telecom",
    extRef: "CLI-1012",
    monthlyRevenueBase: 51000,
    monthlyCostBase: 47200, // ~7.5% margin
    revenueVariance: 0.03,
    costVariance: 0.03,
    costCategories: [
      { category: "Carrier Interconnect Fees", share: 0.55 },
      { category: "Technical Account Manager", share: 0.3 },
      { category: "Hosting", share: 0.15 },
    ],
    expectedType: "low_margin",
  },
  {
    name: "Crestview Properties",
    extRef: "CLI-1013",
    monthlyRevenueBase: 19000,
    monthlyCostBase: 15800, // ~16.8% margin
    revenueVariance: 0.06,
    costVariance: 0.05,
    costCategories: [
      { category: "Out of Scope Customizations", share: 0.45 },
      { category: "Support Desk", share: 0.35 },
      { category: "Infrastructure", share: 0.2 },
    ],
    expectedType: "low_margin",
  },

  // Loss-Making Clients (<5% margin / negative)
  {
    name: "Nexus Infrastructure",
    extRef: "CLI-1014",
    monthlyRevenueBase: 34000,
    monthlyCostBase: 44000, // -29% margin (heavy losses)
    revenueVariance: 0.04,
    costVariance: 0.08,
    costCategories: [
      { category: "SLA Penalty Credits", share: 0.4 },
      { category: "Overtime Engineering Hours", share: 0.35 },
      { category: "Dedicated Bare Metal Hosting", share: 0.25 },
    ],
    expectedType: "loss_making",
  },
  {
    name: "Silverline Automotive",
    extRef: "CLI-1015",
    monthlyRevenueBase: 26000,
    monthlyCostBase: 31500, // -21% margin
    revenueVariance: 0.06,
    costVariance: 0.09,
    costCategories: [
      { category: "Contractual Discounting", share: 0.45 },
      { category: "On-Call Escalation Labor", share: 0.35 },
      { category: "Custom Server Clustered Nodes", share: 0.2 },
    ],
    expectedType: "loss_making",
  },
  {
    name: "Cascade Energy Systems",
    extRef: "CLI-1016",
    monthlyRevenueBase: 22000,
    monthlyCostBase: 29500, // -34% margin
    revenueVariance: 0.05,
    costVariance: 0.1,
    costCategories: [
      { category: "Unbilled Integration Overrun", share: 0.5 },
      { category: "Senior Architect Time", share: 0.3 },
      { category: "Legacy Maintenance", share: 0.2 },
    ],
    expectedType: "loss_making",
  },
  {
    name: "Pinnacle Hospitality",
    extRef: "CLI-1017",
    monthlyRevenueBase: 18000,
    monthlyCostBase: 20500, // -13.8% margin
    revenueVariance: 0.08,
    costVariance: 0.06,
    costCategories: [
      { category: "High Support Ticket Escalations", share: 0.5 },
      { category: "Payment Gateway Dispute Fees", share: 0.25 },
      { category: "Infrastructure Maintenance", share: 0.25 },
    ],
    expectedType: "loss_making",
  },
  {
    name: "BlueStar Cyber Defense",
    extRef: "CLI-1018",
    monthlyRevenueBase: 15000,
    monthlyCostBase: 21800, // -45% margin (loss leader that didn't convert)
    revenueVariance: 0.05,
    costVariance: 0.08,
    costCategories: [
      { category: "Underpriced Pilot Subsidies", share: 0.55 },
      { category: "Hardware Security Modules", share: 0.3 },
      { category: "Customer Success", share: 0.15 },
    ],
    expectedType: "loss_making",
  },
];

export async function seedSampleData(organizationId: string, userId?: string) {
  // First clear any existing sample data if needed
  await clearDemoData(organizationId);

  // Pick or create upload record for demo data
  let uploadId: string | null = null;
  if (userId) {
    const upload = await prisma.upload.create({
      data: {
        organizationId,
        uploadedByUserId: userId,
        fileName: "demo_sample_dataset_12m.csv",
        uploadType: "combined",
        status: "completed",
        totalRows: 0,
        validRows: 0,
        failedRows: 0,
        columnMapping: JSON.stringify({
          clientName: "Client Name",
          transactionDate: "Date",
          amount: "Amount",
          type: "Type",
          category: "Category",
          description: "Description",
        }),
      },
    });
    uploadId = upload.id;
  }

  // Generate 12 months of monthly transactions ending this month
  const now = new Date();
  const months: Date[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(m);
  }

  const transactionsToCreate: any[] = [];
  let totalRows = 0;

  for (const clientConfig of DEMO_CLIENTS) {
    // 1. Create client
    const client = await prisma.client.create({
      data: {
        organizationId,
        name: clientConfig.name,
        externalReference: clientConfig.extRef,
        isActive: true,
      },
    });

    // 2. Generate 12 months of revenue and costs
    months.forEach((monthDate, mIndex) => {
      // Small seasonal wave
      const wave = Math.sin((mIndex / 12) * Math.PI * 2) * 0.08;
      const revMultiplier = 1 + wave + (Math.random() * 2 - 1) * clientConfig.revenueVariance;
      const monthlyRevenue = Math.round(clientConfig.monthlyRevenueBase * revMultiplier * 100) / 100;

      // Revenue transaction
      transactionsToCreate.push({
        organizationId,
        clientId: client.id,
        uploadId,
        transactionDate: new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 5)),
        type: "revenue",
        category: "Software Subscription & Services",
        amount: monthlyRevenue,
        description: `Monthly contract recurring fee - ${clientConfig.name}`,
      });
      totalRows++;

      // Cost transactions split by category
      const costMultiplier = 1 + (Math.random() * 2 - 1) * clientConfig.costVariance;
      const totalMonthlyCost = clientConfig.monthlyCostBase * costMultiplier;

      clientConfig.costCategories.forEach((cat, cIdx) => {
        const catAmount = Math.round(totalMonthlyCost * cat.share * 100) / 100;
        const dayOfMonth = 10 + cIdx * 4;
        transactionsToCreate.push({
          organizationId,
          clientId: client.id,
          uploadId,
          transactionDate: new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), dayOfMonth)),
          type: "cost",
          category: cat.category,
          amount: catAmount,
          description: `${cat.category} expenses for ${clientConfig.name}`,
        });
        totalRows++;
      });
    });
  }

  // Batch insert transactions in chunks
  const chunkSize = 200;
  for (let i = 0; i < transactionsToCreate.length; i += chunkSize) {
    const chunk = transactionsToCreate.slice(i, i + chunkSize);
    await prisma.transaction.createMany({
      data: chunk,
    });
  }

  if (uploadId) {
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        totalRows,
        validRows: totalRows,
      },
    });
  }

  // 3. Recalculate client period summaries
  await recalculateClientSummaries(organizationId);

  return { totalClients: DEMO_CLIENTS.length, totalTransactions: totalRows };
}

export async function clearDemoData(organizationId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.clientPeriodSummary.deleteMany({ where: { organizationId } });
    await tx.transaction.deleteMany({ where: { organizationId } });
    await tx.client.deleteMany({ where: { organizationId } });
    await tx.upload.deleteMany({ where: { organizationId } });
  });
}
