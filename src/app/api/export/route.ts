import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import PdfPrinter from "pdfmake-lite";
import { PassThrough } from "stream";

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

    // ✅ Define PDF layout
    const avgMood = data.reduce((a, r) => a + (r.mood_level || 0), 0) / data.length;
    const avgSleep = data.reduce((a, r) => a + (r.sleep_hours || 0), 0) / data.length;
    const avgExercise = data.reduce((a, r) => a + (r.exercise_minutes || 0), 0) / data.length;

    const docDefinition = {
      content: [
        { text: "Wellness Progress Report", style: "header" },
        { text: `Generated: ${new Date().toLocaleString()}`, margin: [0, 10, 0, 20] },
        {
          text: [
            `Average Mood: ${avgMood.toFixed(2)}\n`,
            `Average Sleep: ${avgSleep.toFixed(2)} hours\n`,
            `Average Exercise: ${avgExercise.toFixed(2)} minutes\n`,
          ],
        },
        { text: "Entries", style: "subheader", margin: [0, 20, 0, 10] },
        ...data.map((r) => ({
          text: `${new Date(r.created_at).toLocaleDateString()} - Mood: ${r.mood_level ?? "N/A"}, Sleep: ${r.sleep_hours ?? "N/A"}h, Exercise: ${r.exercise_minutes ?? "N/A"}m\n${r.journal_entry ? `"${r.journal_entry}"` : ""}`,
          margin: [0, 0, 0, 8],
          fontSize: 10,
        })),
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: "center" },
        subheader: { fontSize: 14, bold: true },
      },
    };

    // ✅ Create PDF
    const fonts = { Roboto: { normal: undefined } };
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    const stream = new PassThrough();
    pdfDoc.pipe(stream);
    pdfDoc.end();

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
