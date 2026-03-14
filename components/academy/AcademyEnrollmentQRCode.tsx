'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2 } from 'lucide-react';

interface AcademyEnrollmentQRCodeProps {
  value: string;
  academyName: string;
}

export function AcademyEnrollmentQRCode({ value, academyName }: AcademyEnrollmentQRCodeProps) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      width: 520,
      margin: 1,
      color: {
        dark: '#0b1220',
        light: '#f8fafc',
      },
    }).then((url: string) => {
      if (active) setDataUrl(url);
    }).catch(() => {
      if (active) setDataUrl('');
    });

    return () => {
      active = false;
    };
  }, [value]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = `${academyName.toLowerCase().replace(/\s+/g, '-')}-cadastro.png`;
    anchor.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Cadastro ${academyName}`,
        text: `Use este link para entrar na academia ${academyName}.`,
        url: value,
      });
      return;
    }

    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <div className="rounded-[22px] bg-slate-50 p-4">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code de cadastro da academia ${academyName}`}
            className="mx-auto h-56 w-56 rounded-[18px]"
          />
        ) : (
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-[18px] bg-slate-100 text-sm text-slate-500">
            Gerando QR Code...
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Baixar
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}
