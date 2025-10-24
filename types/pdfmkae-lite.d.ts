/**
 * Custom declaration for the pdfkit standalone build.
 * Vercel + TypeScript safe — eliminates TS7016 warnings.
 *
 * This tells TypeScript “trust me, this module exists
 * and I’ll handle runtime validation myself.”
 */
declare module "pdfkit/js/pdfkit.standalone.js" {
  // pdfkit standalone bundle exports a single constructor
  const PDFDocument: any;
  export default PDFDocument;
}
