import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "combined";

  let csvContent = "";
  let fileName = "profitlens_sample_template.csv";

  if (type === "sales") {
    fileName = "profitlens_sales_revenue_template.csv";
    csvContent = `Client Name,Transaction Date,Amount,Category,Description
CloudScale Tech,2026-03-01,42000.00,Software Subscription,Enterprise recurring platform license
Apex Dynamics,2026-03-05,55000.00,Professional Services,Implementation phase 2 retainer
Global Retail Partners,2026-03-10,84000.00,Software Subscription,Enterprise tier volume license
Horizon Financial,2026-03-15,32000.00,Software Subscription,Monthly compliance & analytics access
Nexus Infrastructure,2026-03-20,34000.00,Managed Services,Monthly operations support contract
`;
  } else if (type === "cost") {
    fileName = "profitlens_cost_expense_template.csv";
    csvContent = `Client Name,Transaction Date,Amount,Category,Description
CloudScale Tech,2026-03-12,8250.00,Cloud Infrastructure,Dedicated AWS EC2 and RDS compute cluster
CloudScale Tech,2026-03-15,4125.00,Customer Support,Tier 2 engineer dedicated escalation hours
Apex Dynamics,2026-03-14,10400.00,Implementation,Custom integration engineering labor
Global Retail Partners,2026-03-18,30600.00,High Volume Discounts,Contractual volume rebate
Nexus Infrastructure,2026-03-22,17600.00,SLA Penalty Credits,Downtime SLA contractual refund credit
`;
  } else {
    // Combined
    fileName = "profitlens_combined_template.csv";
    csvContent = `Client Name,Date,Type,Category,Amount,Description
CloudScale Tech,2026-03-01,Revenue,Software Subscription,42000.00,Monthly recurring enterprise license
CloudScale Tech,2026-03-12,Cost,Cloud Infrastructure,8250.00,Dedicated AWS compute nodes
Apex Dynamics,2026-03-05,Revenue,Professional Services,55000.00,Q1 enterprise platform fee
Apex Dynamics,2026-03-14,Cost,Implementation,10400.00,Specialized integration engineer hours
Global Retail Partners,2026-03-10,Revenue,Software Subscription,84000.00,Global enterprise tier license
Global Retail Partners,2026-03-18,Cost,High Volume Discounts,30600.00,Contractual high volume rebate
Nexus Infrastructure,2026-03-02,Revenue,Managed Services,34000.00,Legacy managed hosting SLA
Nexus Infrastructure,2026-03-15,Cost,SLA Penalty Credits,17600.00,Contractual penalty deduction
Nexus Infrastructure,2026-03-20,Cost,Overtime Engineering Hours,15400.00,Emergency weekend on-call labor
`;
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
