import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agenda = await prisma.agenda.findUnique({
      where: { id: params.id }
    });

    if (!agenda) {
      return NextResponse.json(
        { error: "Agenda not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(agenda);
  } catch (error) {
    console.error("Error fetching agenda:", error);
    return NextResponse.json(
      { error: "Failed to fetch agenda" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, description, eventType, pesantrenName, location, eventDate, image, isActive } = body;

    const agenda = await prisma.agenda.update({
      where: { id: params.id },
      data: {
        title,
        description,
        eventType,
        pesantrenName,
        location,
        eventDate: new Date(eventDate),
        image,
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error("Error updating agenda:", error);
    return NextResponse.json(
      { error: "Failed to update agenda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.agenda.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Agenda deleted successfully" });
  } catch (error) {
    console.error("Error deleting agenda:", error);
    return NextResponse.json(
      { error: "Failed to delete agenda" },
      { status: 500 }
    );
  }
}
