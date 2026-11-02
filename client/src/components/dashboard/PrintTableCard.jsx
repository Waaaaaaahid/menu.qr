import React from 'react';
import { Printer, Download, X, QrCode } from 'lucide-react';

export default function PrintTableCard({ table, restaurant, onClose }) {
  if (!table || !restaurant) return null;

  const handlePrint = () => {
    window.print();
  };

  const downloadPng = () => {
    if (!table.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = table.qrCodeDataUrl;
    a.download = `${restaurant.slug}-table-${table.tableNumber}-qr.png`;
    a.click();
  };

  const downloadSvg = () => {
    if (!table.qrCodeSvg) return;
    const blob = new Blob([table.qrCodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${restaurant.slug}-table-${table.tableNumber}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Control bar (hidden during print) */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 print:shadow-none print:border-none print:max-w-none">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Print Table Stand — {table.tableNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPng}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              onClick={downloadSvg}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              SVG
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable tent card layout */}
        <div className="p-8 flex flex-col items-center justify-center text-center bg-white print:p-0 print:m-auto">
          <div className="w-full max-w-xs p-8 rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-amber-50/40 to-white flex flex-col items-center shadow-subtle print:border-slate-800 print:shadow-none">
            {/* Logo / Badge */}
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-16 h-16 rounded-2xl object-cover mb-3 border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white font-extrabold flex items-center justify-center text-lg mb-3 shadow-md shadow-brand-500/20">
                {restaurant.name?.substring(0, 2).toUpperCase()}
              </div>
            )}

            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
              {restaurant.name}
            </h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Scan to view digital menu & order
            </p>

            {/* QR Code Graphic */}
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md mb-6">
              <img
                src={table.qrCodeDataUrl}
                alt={`QR code for table ${table.tableNumber}`}
                className="w-48 h-48 object-contain"
              />
            </div>

            {/* Table Number Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white shadow-sm mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Table
              </span>
              <span className="text-base font-extrabold text-brand-400">
                {table.tableNumber}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              No app needed • Point phone camera at QR code
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
              <span>Powered by</span>
              <span className="text-brand-500 font-extrabold">MenuQR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
