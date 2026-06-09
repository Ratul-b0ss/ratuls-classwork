import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const assignment = await prisma.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        dueDate: body.dueDate || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
      },
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
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
    const assignment = await prisma.assignment.update({
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
    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Update assignment error:", error);
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
    await prisma.assignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
