// Shared pdf.js loader. Serves the worker locally from /public so it never
// depends on a CDN version that may not exist (cdnjs lacks pdfjs-dist 6.x).
export async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}
