import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";
import { seedSampleData } from "../lib/demo-data";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });


async function main() {
  console.log("Seeding ProfitLens initial database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Check if demo user already exists
  let user = await prisma.user.findUnique({
    where: { email: "demo@profitlens.io" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@profitlens.io",
        fullName: "Alex Vance (CFO)",
        passwordHash,
      },
    });
  }

  // Create or get organization
  let org = await prisma.organization.findFirst({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Acme Global Technologies",
        industry: "B2B SaaS & Professional Services",
        profitableMarginThreshold: 20.0,
        lowMarginThreshold: 5.0,
        members: {
          create: {
            userId: user.id,
            role: "owner",
            status: "active",
          },
        },
      },
    });
  }

  // Seed sample transactions and clients
  const result = await seedSampleData(org.id, user.id);
  console.log(`Seeded ${result.totalClients} clients and ${result.totalTransactions} transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
