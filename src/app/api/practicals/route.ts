import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const practicals = await prisma.practical.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(practicals);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const practical = await prisma.practical.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        dueDate: body.dueDate || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
      },
    });
    return NextResponse.json(practical, { status: 201 });
  } catch (error) {
    console.error("Create practical error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const practical = await prisma.practical.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        dueDate: body.dueDate || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
      },
    });
    return NextResponse.json(practical);
  } catch (error) {
    console.error("Update practical error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    await prisma.practical.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete practical error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
