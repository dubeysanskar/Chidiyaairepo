import { NextResponse } from "next/server";
import { sendMeetingRequestNotification } from "../../../lib/email";

export async function POST(req: Request) {
    try {
        const { name, email, phone, date, timeSlot, topic, userType } = await req.json();

        // Validate required fields
        if (!name || !email || !date || !timeSlot || !topic) {
            return NextResponse.json(
                { error: "Name, email, date, time slot, and topic are required" },
                { status: 400 }
            );
        }

        // Send email notification to admins
        await sendMeetingRequestNotification({
            name,
            email,
            phone: phone || undefined,
            date,
            timeSlot,
            topic,
            userType: userType || "visitor",
        });

        // Generate Google Calendar "Add Event" URL
        const eventDate = new Date(date);
        const [hours, minutes] = timeSlot.split(":").map(Number);
        eventDate.setHours(hours || 10, minutes || 0, 0, 0);

        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 1); // 1 hour meeting

        const formatGCalDate = (d: Date) =>
            d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
            `ChidiyaAI Meeting — ${topic}`
        )}&dates=${formatGCalDate(eventDate)}/${formatGCalDate(
            endDate
        )}&details=${encodeURIComponent(
            `Meeting with ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\nTopic: ${topic}`
        )}&sf=true&output=xml`;

        return NextResponse.json({
            success: true,
            message: "Meeting request sent! Admin will confirm shortly.",
            gcalUrl,
        });
    } catch (error) {
        console.error("Schedule meeting error:", error);
        return NextResponse.json(
            { error: "Failed to schedule meeting" },
            { status: 500 }
        );
    }
}
