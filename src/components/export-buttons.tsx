"use client";

import { useState } from "react";

// The PDF and Excel buttons of a report (FR-24, FR-25). A report is a list of
// tables; each table has a title, column names, rows, and an optional totals
// row. The files are made in the browser from the same rows shown on screen,
// so what is exported always matches what the administrator sees.

export type ReportTable = {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  totals?: Array<string | number>;
  // Positions of the columns that hold pesos (the first column is 0).
  moneyColumns?: number[];
};

type Props = {
  fileName: string;
  heading: string;
  tables: ReportTable[];
};

export default function ExportButtons({ fileName, heading, tables }: Props) {
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);
  const [failed, setFailed] = useState(false);

  // The libraries are large, so they are loaded only when a button is pressed.
  async function exportPdf() {
    setBusy("pdf");
    setFailed(false);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      pdf.setFontSize(14);
      pdf.text(heading, 40, 40);
      let top = 60;
      for (const table of tables) {
        const money = table.moneyColumns ?? [];
        const toText = (row: Array<string | number>) =>
          row.map((value, column) => pdfText(value, money.includes(column)));
        pdf.setFontSize(11);
        pdf.text(table.title, 40, top + 10);
        autoTable(pdf, {
          startY: top + 18,
          head: [table.columns],
          body: table.rows.map(toText),
          foot: table.totals ? [toText(table.totals)] : undefined,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [31, 92, 69] },
          footStyles: { fillColor: [227, 239, 232], textColor: [28, 42, 35] },
          margin: { left: 40, right: 40 },
        });
        // Where the table ended, so the next one starts below it.
        top = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
      }
      pdf.save(`${fileName}.pdf`);
    } catch {
      setFailed(true);
    }
    setBusy(null);
  }

  async function exportExcel() {
    setBusy("excel");
    setFailed(false);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      for (const table of tables) {
        const lines = [table.columns, ...table.rows];
        if (table.totals) lines.push(table.totals);
        const sheet = XLSX.utils.aoa_to_sheet(lines);
        // Sheet names cannot be longer than 31 characters.
        XLSX.utils.book_append_sheet(workbook, sheet, table.title.slice(0, 31));
      }
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch {
      setFailed(true);
    }
    setBusy(null);
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportPdf} disabled={busy !== null} className="btn btn-primary">
        {busy === "pdf" ? "Making the PDF..." : "Export to PDF"}
      </button>
      <button type="button" onClick={exportExcel} disabled={busy !== null} className="btn btn-quiet">
        {busy === "excel" ? "Making the file..." : "Export to Excel"}
      </button>
      {failed && (
        <p role="alert" className="text-base text-refused">
          The file could not be made. Please try again.
        </p>
      )}
    </div>
  );
}

// In the PDF, amounts are written with two decimals. (The built-in PDF font has
// no peso sign, so the column title says "pesos" instead.)
function pdfText(value: string | number, isMoney: boolean) {
  if (typeof value !== "number") return value;
  return isMoney
    ? value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value);
}
