'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BrandLogo } from '@/components/BrandLogo';

interface PrintableTableQrCardProps {
  partner1Name: string;
  partner2Name: string;
  scanUrl: string;
  accentColor?: string;
}

export function PrintableTableQrCard({
  partner1Name,
  partner2Name,
  scanUrl,
  accentColor = '#B8925A',
}: PrintableTableQrCardProps) {
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 10mm;
          }

          html,
          body {
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-qr-card,
          #printable-qr-card * {
            visibility: visible !important;
          }

          #printable-qr-card {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 340px !important;
            max-width: 92vw !important;
            margin: 0 !important;
            padding: 22px 20px !important;
            border: 2px solid ${accentColor} !important;
            border-radius: 24px !important;
            background: #ffffff !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      <div
        id="printable-qr-card"
        className="rounded-3xl bg-white border border-[#E8DFD3] p-6 text-center shadow-sm"
      >
        <p
          style={{ color: accentColor }}
          className="text-[11px] uppercase tracking-[0.22em] font-semibold"
        >
          Share The Love
        </p>

        <h3 className="font-serif text-2xl font-semibold mt-1 text-[#2C2520]">
          {partner1Name} &amp; {partner2Name}
        </h3>

        <p className="text-xs text-[#7A6F67] mt-1 mb-4">
          Scan to upload your wedding photos &amp; view our live memories gallery
        </p>

        {/* Direct-to-Memories QR Code */}
        <div className="inline-flex p-3.5 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]">
          <QRCodeSVG
            value={scanUrl}
            size={164}
            bgColor="#FAF8F5"
            fgColor="#2C2520"
            level="M"
          />
        </div>

        {/* Chrome / Google Lens Visual Scan Guide */}
        <div className="mt-4 rounded-2xl border border-[#E8DFD3] bg-[#FAF8F5]/90 p-3 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2C2520] text-center mb-2">
            How to Scan with Google Chrome
          </p>

          {/* Mini Chrome Search Bar Illustration pointing to Google Lens Icon */}
          <div className="mx-auto max-w-[245px] rounded-full bg-[#202124] px-3 py-1.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              {/* Google G Badge */}
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#4285F4]">
                G
              </span>
              <span className="truncate text-[10px] text-gray-300">
                Search Google or type...
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              {/* Mic icon */}
              <svg
                className="w-3 h-3 text-gray-300"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>

              {/* Highlighted Google Lens Camera Icon */}
              <span
                style={{ borderColor: accentColor, backgroundColor: `${accentColor}30` }}
                className="relative flex items-center justify-center rounded-full border-2 p-1"
                title="Tap Google Lens icon"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 3H5a2 2 0 0 0-2 2v2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="17.5" cy="17.5" r="1" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>

          <ol className="mt-2 space-y-0.5 text-[10px] leading-snug text-[#5C534C] text-center">
            <li>
              <strong>1.</strong> Open <strong>Chrome</strong> &amp; tap the highlighted{' '}
              <strong>Google Lens</strong> camera icon
            </li>
            <li>
              <strong>2.</strong> Point your camera at the QR code &amp; tap the link to upload
            </li>
          </ol>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E8DFD3]">
          <BrandLogo size="sm" showSubtext centered href={null} />
        </div>
      </div>
    </>
  );
}