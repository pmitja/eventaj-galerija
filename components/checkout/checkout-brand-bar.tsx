import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/lib/i18n/locale";
import { localizedMarketingPath } from "@/lib/i18n/routes";
import { brandName, guestBrandMark } from "@/lib/seo";

/** Enotna glava nakupne poti: /naroci, /nakup/uspesen in /manage/[token]. */
export function CheckoutBrandBar({ locale, back }: { locale: Locale; back?: string }) {
  const home = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      {back ? (
        <Link className="inline-flex min-h-11 items-center gap-2 text-[14px] font-[750] text-[#7f3155]! hover:text-plum!" href={home}>
          <ArrowLeft className="size-[18px]" aria-hidden="true" /> {back}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <Link className="inline-flex items-center gap-[9px] text-[18px] font-extrabold tracking-[-.02em] whitespace-nowrap text-plum!" href={home}>
        {brandMarkSrc ? <img className="block size-[30px] flex-none" src={brandMarkSrc} alt="" width={30} height={30} /> : null}
        <span>{brandName(locale)}</span>
      </Link>
    </div>
  );
}
