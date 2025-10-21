import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";

// ✅ Custom PDFKit class that skips default Helvetica preload
class SafePDFDocument extends PDFDocument {
  constructor(options: any = {}) {
    super({
      ...options,
      autoFirstPage: false, // prevent PDFKit from auto-loading Helvetica on init
    });
  }
}

export async function GET() {
  try {
    console.log("🟢 /api/report endpoint hit — generating custom font PDF");

    // --- Supabase data fetch ---
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("wellness")
      .select("created_at, mood_level, sleep_hours, exercise_minutes, journal_entry")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0)
      return NextResponse.json({ message: "No data available" }, { status: 404 });

    // --- Stream setup ---
    const stream = new PassThrough();
    const doc = new SafePDFDocument({ margin: 50 });
    doc.pipe(stream);

    // ✅ Load and register RobotoMono font before adding the first page
    const fontPath = path.resolve("./public/fonts/RobotoMono-Regular.ttf");
    if (!fs.existsSync(fontPath)) throw new Error(`Font file not found at ${fontPath}`);
    doc.registerFont("RobotoMono", fontPath);

    // ✅ Add first page *after* font registration
    doc.addPage();
    doc.font("RobotoMono");

    // --- PDF content ---
    doc.fontSize(18).text("Wellness Progress Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    const avgMood = data.reduce((a, r) => a + (r.mood_level || 0), 0) / data.length;
    const avgSleep = data.reduce((a, r) => a + (r.sleep_hours || 0), 0) / data.length;
    const avgExercise =
      data.reduce((a, r) => a + (r.exercise_minutes || 0), 0) / data.length;

    doc.text(`Average Mood: ${avgMood.toFixed(2)}`);
    doc.text(`Average Sleep: ${avgSleep.toFixed(2)} hours`);
    doc.text(`Average Exercise: ${avgExercise.toFixed(2)} minutes`);
    doc.moveDown();

    doc.fontSize(14).text("Entries", { underline: true });
    doc.moveDown(0.5);

    data.forEach((r) => {
      doc.fontSize(12).text(
        `${new Date(r.created_at).toLocaleDateString()} - Mood: ${r.mood_level ?? "N/A"}, Sleep: ${
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

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (err) => reject(err));
    });

    console.log("✅ PDF successfully generated with RobotoMono");
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=wellness_report.pdf",
      },
    });
  } catch (err: any) {
    console.error("💥 PDF export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
