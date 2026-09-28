import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseCsvText, autoDetectColumnMapping, MAX_FILE_SIZE_BYTES, MAX_CSV_ROWS } from "@/lib/csv/parser";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const [uploads, total] = await Promise.all([
    prisma.upload.findMany({
      where: { organizationId: auth.organization.id },
      include: {
        uploadedBy: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.upload.count({
      where: { organizationId: auth.organization.id },
    }),
  ]);

  return NextResponse.json({
    data: uploads,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

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

  // Rate limit uploads per user (max 10 uploads per minute)
  const rl = rateLimit(auth.user.id, { keyPrefix: "upload", limit: 10, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many upload requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let csvText = "";
    let fileName = "upload.csv";
    let uploadType: "combined" | "sales" | "cost" = "combined";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const typeParam = formData.get("uploadType") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File size exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB provided).` },
          { status: 400 }
        );
      }

      if (!file.name.toLowerCase().endsWith(".csv")) {
        return NextResponse.json(
          { error: "Invalid file format. Only .csv files are supported." },
          { status: 400 }
        );
      }

      fileName = file.name;
      csvText = await file.text();
      if (typeParam === "sales" || typeParam === "cost") {
        uploadType = typeParam;
      }
    } else {
      const body = await req.json();
      csvText = body.csvText || "";
      fileName = body.fileName || "data.csv";
      uploadType = body.uploadType || "combined";

      if (Buffer.byteLength(csvText, "utf8") > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Payload exceeds 10MB size limit." },
          { status: 400 }
        );
      }
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    const { headers, rows } = parseCsvText(csvText);

    if (headers.length === 0 || rows.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any columns or rows from CSV. Please check delimiters and header row." },
        { status: 400 }
      );
    }

    if (rows.length > MAX_CSV_ROWS) {
      return NextResponse.json(
        { error: `File has ${rows.length} rows, which exceeds the maximum of ${MAX_CSV_ROWS} rows per upload batch.` },
        { status: 400 }
      );
    }

    const autoMapping = autoDetectColumnMapping(headers, uploadType);
    const sampleRows = rows.slice(0, 10);

    return NextResponse.json({
      data: {
        fileName,
        uploadType,
        totalRows: rows.length,
        headers,
        autoMapping,
        sampleRows,
        rawCsvText: csvText,
      },
    });
  } catch (error: any) {
    console.error("Upload parse error:", error);
    return NextResponse.json({ error: "Failed to parse CSV upload. Please check the file formatting." }, { status: 500 });
  }
}
