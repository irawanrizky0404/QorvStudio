"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

/**
 * Route error boundary.
 *
 * Sebentuk dengan halaman 404 supaya keduanya terbaca sebagai satu keluarga
 * keadaan, bukan dua halaman yang kebetulan sama-sama gagal. Bedanya satu:
 * blok penanda memakai garis merah, bukan acid — acid berarti "aksi utama" di
 * seluruh situs ini, dan sebuah kegagalan bukan itu.
 *
 * `digest` ditampilkan karena ia satu-satunya yang bisa dibawa pengunjung saat
 * melapor; detail sebenarnya tetap di server.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode {
  const { dictionary: t } = useDictionary();

  useEffect(() => {
    // Detail stays server-side in production; the digest is the correlation id.
    console.error("[route error]", error.digest ?? error.message);
  }, [error]);

  return (
    <Container className="flex min-h-[70vh] items-center py-20">
      <div className="grid w-full items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12">
        <p
          aria-hidden
          className="display flex items-center justify-center border-3 border-danger bg-paper px-8 py-6 text-[clamp(3rem,9vw,6.5rem)] leading-none text-danger shadow-[16px_16px_0_var(--color-danger)]"
        >
          !
        </p>

        <div className="grid gap-5">
          <h1 className="display rank-2 max-w-[14ch]">{t.states.errorTitle}</h1>
          <p className="max-w-[46ch] text-[15.5px] leading-relaxed">
            {t.states.errorBody}
          </p>
          {error.digest ? (
            <p className="label tabular border-3 border-ink px-4 py-3 justify-self-start">
              REF: {error.digest}
            </p>
          ) : null}
          <div className="justify-self-start pt-2">
            <Button size="lg" onClick={reset}>
              {t.common.retry}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
