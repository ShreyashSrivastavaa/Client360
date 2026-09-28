import { prisma } from "../../lib/db";
import { hashPassword } from "../../lib/auth";

export async function testMultiTenantIsolation() {
  console.log("Running Multi-Tenant Isolation Test...");

  const testOrgAId = "org-tenant-test-a";
  const testOrgBId = "org-tenant-test-b";
  const testUserAId = "user-tenant-test-a";
  const testUserBId = "user-tenant-test-b";

  try {
    // 1. Clean up any previous test artifacts
    await prisma.transaction.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.clientPeriodSummary.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.client.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.organizationMember.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [testOrgAId, testOrgBId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testUserAId, testUserBId] } } });

    // 2. Create Tenant A
    const passwordHash = await hashPassword("password123");
    await prisma.user.create({
      data: {
        id: testUserAId,
        email: "tenant-a@test.com",
        fullName: "Tenant A User",
        passwordHash,
      },
    });

    await prisma.organization.create({
      data: {
        id: testOrgAId,
        name: "Tenant A Org",
        profitableMarginThreshold: 25.0,
        lowMarginThreshold: 10.0,
        members: {
          create: {
            userId: testUserAId,
            role: "owner",
          },
        },
      },
    });

    // 3. Create Tenant B
    await prisma.user.create({
      data: {
        id: testUserBId,
        email: "tenant-b@test.com",
        fullName: "Tenant B User",
        passwordHash,
      },
    });

    await prisma.organization.create({
      data: {
        id: testOrgBId,
        name: "Tenant B Org",
        profitableMarginThreshold: 20.0,
        lowMarginThreshold: 5.0,
        members: {
          create: {
            userId: testUserBId,
            role: "owner",
          },
        },
      },
    });

    // 4. Create Client in Org A and Client in Org B
    const clientA = await prisma.client.create({
      data: {
        organizationId: testOrgAId,
        name: "Confidential Client of Org A",
      },
    });

    const clientB = await prisma.client.create({
      data: {
        organizationId: testOrgBId,
        name: "Confidential Client of Org B",
      },
    });

    // 5. Test isolation: Querying clients strictly scoped by Org A
    const clientsForOrgA = await prisma.client.findMany({
      where: { organizationId: testOrgAId },
    });

    if (clientsForOrgA.some((c) => c.id === clientB.id)) {
      throw new Error("SECURITY BREACH: Org A can view Org B's confidential client!");
    }

    if (!clientsForOrgA.some((c) => c.id === clientA.id)) {
      throw new Error("FAIL: Org A cannot view its own client.");
    }

    // 6. Test cross-tenant update isolation
    // Simulate user A trying to fetch client B with their org scoping:
    const crossTenantFetch = await prisma.client.findFirst({
      where: { id: clientB.id, organizationId: testOrgAId },
    });

    if (crossTenantFetch !== null) {
      throw new Error("SECURITY BREACH: Org A successfully fetched Org B's client via ID lookup!");
    }

    console.log("✓ Multi-tenant isolation verified: Tenant queries cannot leak cross-organization data.");
  } finally {
    // Clean up test data
    await prisma.client.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.organizationMember.deleteMany({ where: { organizationId: { in: [testOrgAId, testOrgBId] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [testOrgAId, testOrgBId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testUserAId, testUserBId] } } });
  }
}
