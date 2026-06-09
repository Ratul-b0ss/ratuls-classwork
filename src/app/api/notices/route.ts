import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notices);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const notice = await prisma.notice.create({
      data: {
        title: body.title,
        content: body.content,
        date: body.date || null,
      },
    });
    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error("Create notice error:", error);
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
    const notice = await prisma.notice.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        date: body.date || null,
      },
    });
    return NextResponse.json(notice);
  } catch (error) {
    console.error("Update notice error:", error);
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
    await prisma.notice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notice error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
