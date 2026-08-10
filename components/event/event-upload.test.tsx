import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventUpload } from "./event-upload";

describe("EventUpload file pickers", () => {
  it("renders the photo picker when video uploads are disabled", () => {
    const markup = renderToStaticMarkup(
      <EventUpload eventSlug="poroka" guestId="guest-1" />,
    );

    expect(markup).toContain('aria-label="Izberi fotografije iz telefona"');
    expect(markup).not.toContain('aria-label="Izberi videe iz telefona"');
  });

  it("renders both pickers when video uploads are enabled", () => {
    const markup = renderToStaticMarkup(
      <EventUpload eventSlug="poroka" guestId="guest-1" videoUploadsEnabled />,
    );

    expect(markup).toContain('aria-label="Izberi fotografije iz telefona"');
    expect(markup).toContain('aria-label="Izberi videe iz telefona"');
  });
});
