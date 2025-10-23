import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

// Minimal embedded font data (Helvetica-like fallback)
const baseFontData = Buffer.from(`
JVBERi0xLjUKJeLjz9MKMSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UcnVlVHlwZS9CYXNl
Rm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nPj4KZW5kb2JqCnhyZWYKMCAy
CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUg
Mi9Sb290IDEgMCBSL0luZm8gMiAwIFI+PgpzdGFydHhyZWYKNTYKJSVFT0YK
`, "base64");

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from("wellness")
      .select("created_at, mood_level, sleep_hours, exercise_minutes, journal_entry")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0)
      return NextResponse.json({ message: "No data available" }, { status: 404 });

    // Create a PDF stream
    const stream = new PassThrough();
    const doc = new PDFDocument({ margin: 50 });

    // Register and use embedded font (no fs calls)
    doc.registerFont("EmbeddedFont", baseFontData);
    doc.font("EmbeddedFont");

    doc.pipe(stream);

    // PDF CONTENT
    doc.fontSize(18).text("Wellness Progress Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    const avgMood = data.reduce((a, r) => a + (r.mood_level || 0), 0) / data.length;
    const avgSleep = data.reduce((a, r) => a + (r.sleep_hours || 0), 0) / data.length;
    const avgExercise = data.reduce((a, r) => a + (r.exercise_minutes || 0), 0) / data.length;

    doc.text(`Average Mood: ${avgMood.toFixed(2)}`);
    doc.text(`Average Sleep: ${avgSleep.toFixed(2)} hours`);
    doc.text(`Average Exercise: ${avgExercise.toFixed(2)} minutes`);
    doc.moveDown();

    doc.fontSize(14).text("Entries", { underline: true });
    doc.moveDown(0.5);

    data.forEach((r) => {
      doc.fontSize(12).text(
        `${new Date(r.created_at).toLocaleDateString()} - Mood: ${r.mood_level ?? "N/A"}, Sleep: ${r.sleep_hours ?? "N/A"}h, Exercise: ${r.exercise_minutes ?? "N/A"}m`
      );
      if (r.journal_entry) {
        doc.fontSize(10).fillColor("gray").text(`"${r.journal_entry}"`);
        doc.fillColor("black");
      }
      doc.moveDown(0.5);
    });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=wellness_report.pdf",
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
