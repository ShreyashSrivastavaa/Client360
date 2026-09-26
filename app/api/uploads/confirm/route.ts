import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseCsvText, validateCsvRows, ColumnMapping } from "@/lib/csv/parser";
import { recalculateClientSummaries } from "@/lib/calculations/engine";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "member") {
    return NextResponse.json(
      { error: "Insufficient permissions. Members have read-only access." },
      { status: 403 }
    );
  }

  try {
    const { fileName, uploadType, columnMapping, rawCsvText } = await req.json();

    if (!rawCsvText || !columnMapping) {
      return NextResponse.json(
        { error: "Missing required rawCsvText or columnMapping" },
        { status: 400 }
      );
    }

    const { rows } = parseCsvText(rawCsvText);
    const validationResult = validateCsvRows(
      rows,
      columnMapping as ColumnMapping,
      uploadType || "combined"
    );

    if (validationResult.validRows.length === 0) {
      return NextResponse.json(
        {
          error: "No valid rows could be imported. Please review the column mapping and errors.",
          errors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const orgId = auth.organization.id;

    // 1. Fetch existing clients for this org to match case-insensitively
    const existingClients = await prisma.client.findMany({
      where: { organizationId: orgId },
    });

    const clientMap = new Map<string, string>(); // normalized name -> id
    existingClients.forEach((c) => {
      clientMap.set(c.name.trim().toLowerCase(), c.id);
    });

    // 2. Identify new clients to create
    const newClientNames = new Set<string>();
    for (const row of validationResult.validRows) {
      const normalized = row.clientName.trim().toLowerCase();
      if (!clientMap.has(normalized)) {
        newClientNames.add(row.clientName.trim());
      }
    }

    // Create new clients
    for (const name of newClientNames) {
      const created = await prisma.client.create({
        data: {
          organizationId: orgId,
          name,
          isActive: true,
        },
      });
      clientMap.set(name.toLowerCase(), created.id);
    }

    // 3. Create Upload record
    const upload = await prisma.upload.create({
      data: {
        organizationId: orgId,
        uploadedByUserId: auth.user.id,
        fileName: fileName || "upload.csv",
        uploadType: uploadType || "combined",
        columnMapping: JSON.stringify(columnMapping),
        status: validationResult.errors.length > 0 ? "completed" : "completed",
        totalRows: validationResult.totalRows,
        validRows: validationResult.validRows.length,
        failedRows: validationResult.errors.length,
        errorLog: validationResult.errors.length > 0 ? JSON.stringify(validationResult.errors.slice(0, 100)) : null,
      },
    });

    // 4. Prepare transactions to batch insert
    const transactionsData = validationResult.validRows.map((r) => {
      const clientId = clientMap.get(r.clientName.trim().toLowerCase())!;
      return {
        organizationId: orgId,
        clientId,
        uploadId: upload.id,
        transactionDate: r.transactionDate,
        type: r.type,
        category: r.category,
        amount: r.amount,
        description: r.description,
      };
    });

    // Insert transactions in chunks
    const chunkSize = 200;
    for (let i = 0; i < transactionsData.length; i += chunkSize) {
      const chunk = transactionsData.slice(i, i + chunkSize);
      await prisma.transaction.createMany({
        data: chunk,
      });
    }

    // 5. Trigger calculation engine
    await recalculateClientSummaries(orgId);

    return NextResponse.json({
      data: {
        uploadId: upload.id,
        totalRows: validationResult.totalRows,
        validRows: validationResult.validRows.length,
        failedRows: validationResult.errors.length,
        errorSample: validationResult.errors.slice(0, 10),
      },
      message: `Successfully imported ${validationResult.validRows.length} transactions across ${newClientNames.size} new and existing clients.`,
    });
  } catch (error: any) {
    console.error("Confirm upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process import" }, { status: 500 });
  }
}
