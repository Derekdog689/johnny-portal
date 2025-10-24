import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { PassThrough } from "stream";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("wellness")
      .select("created_at, mood_level, sleep_hours, exercise_minutes, journal_entry")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data available" }, { status: 404 });
    }

    // Create stream and PDF document
    const stream = new PassThrough();
    const doc = new PDFDocument({ margin: 50, compress: false });

    // 🔹 Embed RobotoMono as default font
    const fontUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/fonts/RobotoMono-Regular.ttf`;
    const fontResponse = await fetch(fontUrl);
    const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());
    doc.registerFont("RobotoMono", fontBuffer);
    doc.font("RobotoMono");

    // Start piping
    doc.pipe(stream);

    // Header section
    doc.fontSize(18).text("Wellness Progress Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Averages
    const avgMood = data.reduce((a, r) => a + (r.mood_level || 0), 0) / data.length;
    const avgSleep = data.reduce((a, r) => a + (r.sleep_hours || 0), 0) / data.length;
    const avgExercise = data.reduce((a, r) => a + (r.exercise_minutes || 0), 0) / data.length;

    doc.text(`Average Mood: ${avgMood.toFixed(2)}`);
    doc.text(`Average Sleep: ${avgSleep.toFixed(2)} hours`);
    doc.text(`Average Exercise: ${avgExercise.toFixed(2)} minutes`);
    doc.moveDown();

    // Entries
    doc.fontSize(14).text("Entries", { underline: true });
    doc.moveDown(0.5);

    data.forEach((r) => {
      doc.fontSize(12).text(
        `${new Date(r.created_at).toLocaleDateString()} — Mood: ${r.mood_level ?? "N/A"}, Sleep: ${
          r.sleep_hours ?? "N/A"
        }h, Exercise: ${r.exercise_minutes ?? "N/A"}m`
      );
      if (r.journal_entry) {
        doc.fontSize(10).fillColor("gray").text(`"${r.journal_entry}"`);
        doc.fillColor("black");
      }
      doc.moveDown(0.5);
    });

    doc.end();

    // Capture PDF buffer
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

   // Return as downloadable PDF (Edge-safe)
const uint8 = new Uint8Array(pdfBuffer);
return new Response(uint8, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="wellness_report.pdf"',
    "Cache-Control": "no-store",
  },
});

  } catch (err: any) {
    console.error("PDF export error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
