// /src/app/api/trust/export/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';
// @ts-expect-error: standalone build has no TS types
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { PassThrough } from 'stream';

export const runtime = 'nodejs'; // ensure Node runtime (fs/streams OK)

type Tx = { created_at: string; amount: number | null; type: 'distribution' | 'expense'; note?: string | null };

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase
      .from('transactions')
      .select('created_at, amount, type, note')
      .order('created_at', { ascending: true });

    if (error) throw error;
    const rows = (data ?? []) as Tx[];

    // compute summaries
    const totalDist = rows.filter((r) => r.type === 'distribution').reduce((s, r) => s + (r.amount || 0), 0);
    const totalExp = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + (r.amount || 0), 0);
    const avgDist =
      rows.filter((r) => r.type === 'distribution').length > 0
        ? totalDist / rows.filter((r) => r.type === 'distribution').length
        : 0;

    // stream -> buffer
    const stream = new PassThrough();
    const doc = new PDFDocument({ margin: 50, compress: false }); // no Helvetica dependency

    doc.pipe(stream);

    // load and set font from public/
    try {
      // fetch font via absolute URL built from Vercel host header (works locally & prod)
      const base =
        process.env.NEXT_PUBLIC_BASE_URL ||
        // @ts-ignore
        (globalThis?.process?.env?.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const res = await fetch(`${base}/fonts/RobotoMono-Regular.ttf`);
      const fontBuf = Buffer.from(await res.arrayBuffer());
      // @ts-ignore
      doc.font(fontBuf);
    } catch {
      // fallback: default built-in vector font; keep all text simple (no bold/italic)
    }

    const currency = (n: number) =>
      n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    // header
    doc.fontSize(18).text('Trust Summary Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // summaries
    doc.text(`Total Distributed: ${currency(totalDist)}`);
    doc.text(`Total Expenses:    ${currency(totalExp)}`);
    doc.text(`Average Distribution: ${currency(avgDist)}`);
    doc.moveDown();

    // entries
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

    rows.forEach((r) => {
      const date = new Date(r.created_at).toLocaleDateString();
      const line = `${date} — ${r.type === 'distribution' ? 'Distribution' : 'Expense'}: ${currency(r.amount || 0)}`;
      doc.text(line);
      if (r.note) doc.fontSize(10).fillColor('gray').text(`"${r.note}"`).fillColor('black');
      doc.moveDown(0.3);
    });

    doc.end();

    // buffer up
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (c) => chunks.push(c as Buffer));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });

    // send as Uint8Array to satisfy BodyInit
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="trust_report.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Trust PDF export error:', err?.message || err);
    return NextResponse.json({ error: err?.message ?? 'Export failed' }, { status: 500 });
  }
}
