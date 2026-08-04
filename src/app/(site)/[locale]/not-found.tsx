"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

/**
 * 404.
 *
 * Angka besarnya dulu disetel `text-graphite`, yang di palet lama berarti abu
 * gelap di atas hitam — nyaris tak terlihat, sekadar hantu di belakang judul.
 * Di palet kertas warna itu jadi abu terang, dan angkanya hilang sama sekali.
 *
 * Sekarang angkanya adalah objeknya: blok acid bergaris tinta yang membawa
 * "404", dengan judul dan tautan pulang di sebelahnya. Rata kiri seperti seluruh
 * situs, bukan tumpukan rata tengah.
 */
export default function NotFound(): ReactNode {
  const { dictionary: t, locale } = useDictionary();

  return (
    <Container className="flex min-h-[70vh] items-center py-20">
      <div className="grid w-full items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12">
        <p
          aria-hidden
          className="display tabular flex items-center justify-center border-3 border-ink bg-acid px-8 py-6 text-[clamp(4rem,12vw,9rem)] leading-none shadow-[16px_16px_0_var(--color-ink)]"
        >
          404
        </p>

        <div className="grid gap-5">
          <h1 className="display rank-2 max-w-[14ch]">
            {t.states.notFoundTitle}
          </h1>
          <p className="max-w-[46ch] text-[15.5px] leading-relaxed">
            {t.states.notFoundBody}
          </p>
          <div className="justify-self-start pt-2">
            <Button asChild size="lg">
              <Link href={routes.home(locale)}>{t.states.notFoundCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
