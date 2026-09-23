import { DEMO_PHOTO } from "./demo-photos";

const GRID = [5, 2, 3, 4, 1, 6, 7, 8, 9, 3];
const COMMENTS = [2, 1, 1, 0, 1, 0, 0, 2, 1, 0];

/**
 * The guest gallery as it looks on a phone: cover photo with the couple's
 * names, then the "favourite moments" grid. Sizes follow the phone frame
 * through container query units, so it scales with the mock-up.
 */
export function PhoneGalleryScreen({ meta, name, favourites, moments, coverAlt, scroll = true }: {
  meta: string;
  name: string;
  favourites: string;
  moments: string;
  coverAlt: string;
  scroll?: boolean;
}) {
  return (
    <div className={scroll ? "absolute top-0 left-0 w-full animate-[gmScroll_24s_cubic-bezier(.45,0,.55,1)_infinite_alternate]" : "absolute top-0 left-0 w-full"}>
      <div className="relative h-[34cqh]">
        <img src={DEMO_PHOTO(1)} alt={coverAlt} className="absolute inset-0 size-full object-cover" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,15,20,.1),rgba(30,15,20,.65))]" />
        <span className="absolute inset-x-0 bottom-[12%] text-center text-white">
          <span className="block font-[system-ui,sans-serif] text-[clamp(7px,.6vw,9px)] leading-none font-semibold tracking-[.14em]">{meta}</span>
          <span className="mt-1 block font-[Georgia,'Times_New_Roman',serif] text-[clamp(18px,2vw,30px)] leading-[1.15]">{name}</span>
        </span>
      </div>
      <div className="bg-[#fdfaf8] px-[5%] pt-[6%] pb-[8%]">
        <div className="mb-[5%] flex items-baseline justify-between">
          <span className="font-[Georgia,serif] text-[clamp(14px,1.4vw,21px)] text-[#2b1a1f]">{favourites}</span>
          <span className="font-[system-ui,sans-serif] text-[clamp(8px,.7vw,11px)] text-[#6b5a5f]">{moments}</span>
        </div>
        <div className="grid grid-cols-2 gap-[5px]">
          {GRID.map((n, index) => (
            <div key={index} className="relative aspect-[4/5] overflow-hidden rounded">
              <img src={DEMO_PHOTO(n)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              <span className="absolute top-[6%] right-[6%] grid aspect-square w-[22%] place-items-center rounded-full bg-[rgba(60,45,40,.55)] text-[clamp(8px,.8vw,12px)] text-white">♡</span>
              <span className="absolute right-[6%] bottom-[6%] rounded-full bg-[rgba(60,45,40,.6)] px-[7px] py-[3px] font-[system-ui,sans-serif] text-[clamp(7px,.7vw,10px)] leading-[1.2] font-semibold text-white">◌ {COMMENTS[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Dark rounded phone frame; children render inside a size container. */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`aspect-[9/18.6] max-w-full rounded-[clamp(28px,3vw,44px)] bg-gm-ink p-[clamp(7px,.7vw,10px)] shadow-[0_30px_60px_rgba(40,30,20,.28),0_8px_18px_rgba(40,30,20,.14)] ${className ?? ""}`}>
      <div className="relative h-full overflow-hidden rounded-[clamp(22px,2.4vw,36px)] bg-gm-bg [container-type:size]">
        {children}
      </div>
    </div>
  );
}
