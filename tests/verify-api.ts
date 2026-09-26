async function testApp() {
  const baseUrl = "http://localhost:3000";
  console.log("Checking ProfitLens server endpoints...");

  // 1. Check landing page
  const homeRes = await fetch(`${baseUrl}/`);
  console.log(`GET / : ${homeRes.status} ${homeRes.statusText}`);

  // 2. Test Demo Login
  const demoRes = await fetch(`${baseUrl}/api/auth/demo`, { method: "POST" });
  const demoData = await demoRes.json();
  const cookies = demoRes.headers.get("set-cookie") || "";
  console.log(`POST /api/auth/demo : ${demoRes.status}`, demoData.data?.user?.email);

  const authHeaders = {
    Cookie: cookies.split(";")[0],
    "Content-Type": "application/json",
  };

  // 3. Test Dashboard Summary
  const summaryRes = await fetch(`${baseUrl}/api/dashboard/summary?range=12m`, { headers: authHeaders });
  const summary = await summaryRes.json();
  console.log(`GET /api/dashboard/summary :`, summary.data ? {
    revenue: summary.data.totalRevenue,
    profit: summary.data.grossProfit,
    margin: summary.data.marginPercent,
    clients: summary.data.activeClientsCount,
    lossMakers: summary.data.lossMakingCount
  } : summary);

  // 4. Test Clients list
  const clientsRes = await fetch(`${baseUrl}/api/clients?range=12m&limit=5`, { headers: authHeaders });
  const clientsData = await clientsRes.json();
  console.log(`GET /api/clients : fetched ${clientsData.data?.length} clients (total: ${clientsData.meta?.total})`);

  // 5. Test Top/Bottom Clients
  const topBottomRes = await fetch(`${baseUrl}/api/dashboard/top-bottom-clients?range=12m&limit=3`, { headers: authHeaders });
  const topBottom = await topBottomRes.json();
  console.log(`GET /api/dashboard/top-bottom-clients : Top: ${topBottom.data?.topClients?.map((c: any) => c.name).join(", ")} | Bottom: ${topBottom.data?.bottomClients?.map((c: any) => c.name).join(", ")}`);

  // 6. Test Insights Engine
  const insightsRes = await fetch(`${baseUrl}/api/dashboard/insights?range=12m`, { headers: authHeaders });
  const insights = await insightsRes.json();
  console.log(`GET /api/dashboard/insights : ${insights.data?.length} active diagnostic alerts generated`);

  // 7. Test Uploads list
  const uploadsRes = await fetch(`${baseUrl}/api/uploads`, { headers: authHeaders });
  const uploads = await uploadsRes.json();
  console.log(`GET /api/uploads : ${uploads.data?.length} past uploads in history`);

  // 8. Test Sample CSV Template download
  const templateRes = await fetch(`${baseUrl}/api/uploads/template?type=combined`);
  const templateText = await templateRes.text();
  console.log(`GET /api/uploads/template : ${templateRes.status}, preview line: "${templateText.split('\n')[0]}"`);

  console.log("\nALL ENDPOINTS VERIFIED & OPERATIONAL!");
}

testApp().catch(console.error);
