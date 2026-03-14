'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Presentation } from 'lucide-react';

interface ExportDropdownProps {
  /** Array of objects to export */
  data: Record<string, unknown>[];
  /** Report title */
  title: string;
  /** Column names (keys from data objects) */
  columns: string[];
  /** Optional column display labels (same order as columns) */
  columnLabels?: string[];
  /** Academy name */
  academyName?: string;
  /** Custom button className */
  buttonClassName?: string;
  /** Custom button style */
  buttonStyle?: React.CSSProperties;
  /** Custom button label */
  buttonLabel?: string;
  /** Show icon on button */
  showIcon?: boolean;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Sim' : 'Nao';
  return String(val);
}

function getTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

export function ExportDropdown({
  data,
  title,
  columns,
  columnLabels,
  academyName = 'BlackBelt',
  buttonClassName,
  buttonStyle,
  buttonLabel = 'Exportar',
  showIcon = true,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const labels = columnLabels || columns;
  const filename = `${sanitizeFilename(title)}_${getTimestamp()}`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyHandler); };
  }, [open]);

  const triggerDownload = useCallback((blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filename]);

  const exportCSV = useCallback(async () => {
    setExporting('csv');
    try {
      const header = labels.join(',');
      const rows = data.map(row =>
        columns.map(col => {
          const val = formatValue(row[col]);
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(',')
      );
      const bom = '\uFEFF';
      const csv = bom + [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, 'csv');
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }, [data, columns, labels, triggerDownload]);

  const exportExcel = useCallback(async () => {
    setExporting('xlsx');
    try {
      const XLSX = (await import('xlsx')).default || await import('xlsx');
      const wsData = [labels, ...data.map(row => columns.map(col => formatValue(row[col])))];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      // Auto-width
      ws['!cols'] = labels.map((l, i) => {
        const maxLen = Math.max(l.length, ...data.map(row => formatValue(row[columns[i]]).length));
        return { wch: Math.min(maxLen + 2, 40) };
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      triggerDownload(blob, 'xlsx');
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }, [data, columns, labels, title, triggerDownload]);

  const exportPDF = useCallback(async () => {
    setExporting('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const ts = getTimestamp();

      // Header
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${academyName} | Gerado em ${ts}`, 14, 28);

      // Table
      const colWidth = (pageWidth - 28) / labels.length;
      let y = 38;

      // Header row
      doc.setFillColor(30, 30, 30);
      doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(8);
      labels.forEach((label, i) => {
        doc.text(label, 14 + i * colWidth + 2, y);
      });

      // Data rows
      doc.setTextColor(40);
      y += 8;
      data.forEach((row) => {
        if (y > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage();
          y = 20;
        }
        columns.forEach((col, i) => {
          const val = formatValue(row[col]).slice(0, 30);
          doc.text(val, 14 + i * colWidth + 2, y);
        });
        y += 6;
      });

      const blob = doc.output('blob');
      triggerDownload(blob, 'pdf');
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }, [data, columns, labels, title, academyName, triggerDownload]);

  const exportPPTX = useCallback(async () => {
    setExporting('pptx');
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.author = academyName;
      pptx.title = title;

      // Title slide
      const slide1 = pptx.addSlide();
      slide1.addText(title, { x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 28, bold: true, color: '222222' });
      slide1.addText(`${academyName} | ${getTimestamp()}`, { x: 0.5, y: 3, w: 9, h: 0.5, fontSize: 14, color: '666666' });

      // Data slide(s) — table
      const headerRow = labels.map(l => ({ text: l, options: { bold: true, fill: { color: '1a1a1a' }, color: 'FFFFFF', fontSize: 9 } }));
      const PAGE_ROWS = 12;
      for (let i = 0; i < data.length; i += PAGE_ROWS) {
        const slide = pptx.addSlide();
        const chunk = data.slice(i, i + PAGE_ROWS);
        const tableRows = [
          headerRow,
          ...chunk.map(row =>
            columns.map(col => ({ text: formatValue(row[col]).slice(0, 40), options: { fontSize: 8, color: '333333' } }))
          ),
        ];
        slide.addTable(tableRows as Parameters<typeof slide.addTable>[0], {
          x: 0.3, y: 0.3, w: 9.4,
          border: { pt: 0.5, color: 'CCCCCC' },
          colW: labels.map(() => 9.4 / labels.length),
        });
      }

      const out = await pptx.write({ outputType: 'blob' });
      triggerDownload(out as Blob, 'pptx');
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }, [data, columns, labels, title, academyName, triggerDownload]);

  const options = [
    { key: 'pdf', label: 'PDF', icon: FileText, action: exportPDF },
    { key: 'xlsx', label: 'Excel (.xlsx)', icon: Table, action: exportExcel },
    { key: 'csv', label: 'CSV', icon: FileSpreadsheet, action: exportCSV },
    { key: 'pptx', label: 'PowerPoint (.pptx)', icon: Presentation, action: exportPPTX },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={buttonClassName || 'px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2'}
        style={buttonStyle || { border: '1px solid var(--card-border)', borderRadius: 12, color: 'var(--text-primary)', background: 'var(--card-bg)' }}
      >
        {showIcon && <Download className="w-4 h-4" />}
        {buttonLabel}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[220px] rounded-xl overflow-hidden shadow-2xl z-[100]"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            animation: 'shell-dropdown-in 0.15s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="py-1.5 px-1.5">
            {options.map(({ key, label, icon: Icon, action }) => (
              <button
                key={key}
                onClick={action}
                disabled={exporting !== null}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <span className="flex-1 text-left">{label}</span>
                {exporting === key && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>...</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
