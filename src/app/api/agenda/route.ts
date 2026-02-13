import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get("upcoming");
    
    const now = new Date();
    
    const agendas = await prisma.agenda.findMany({
      where: {
        isActive: true,
        ...(upcoming === "true" && {
          eventDate: {
            gte: now
          }
        })
      },
      orderBy: {
        eventDate: 'asc'
      }
    });

    return NextResponse.json(agendas);
  } catch (error) {
    console.error("Error fetching agendas:", error);
    return NextResponse.json(
      { error: "Failed to fetch agendas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, eventType, pesantrenName, location, eventDate, image } = body;

    const agenda = await prisma.agenda.create({
      data: {
        id: nanoid(),
        title,
        description,
        eventType,
        pesantrenName,
        location,
        eventDate: new Date(eventDate),
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error("Error creating agenda:", error);
    return NextResponse.json(
      { error: "Failed to create agenda" },
      { status: 500 }
    );
  }
}
