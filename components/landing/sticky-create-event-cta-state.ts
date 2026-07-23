export type StickyCtaIntersection = {
  isIntersecting: boolean;
  triggerBottom: number;
  rootTop: number;
};

export function isStickyCtaVisible({
  isIntersecting,
  triggerBottom,
  rootTop,
}: StickyCtaIntersection) {
  return !isIntersecting && triggerBottom <= rootTop;
}
