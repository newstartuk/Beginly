// pdf-parse doesn't ship its own TypeScript definitions and we don't want to
// depend on the separate (less actively maintained) @types/pdf-parse package
// for the handful of fields we actually use. This is a minimal ambient
// declaration covering just those fields.
declare module "pdf-parse" {
  interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PDFParseResult>;

  export default pdfParse;
}
