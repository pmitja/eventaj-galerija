"use client";

import Link from "next/link";
import { useState } from "react";
import { EventUpload } from "@/components/event/event-upload";
import { VoiceMessageRecorder } from "@/components/guest/voice-message-recorder";
import { DEMO_EVENT_SLUG } from "@/lib/demo/event";
import { useLocalDemoMedia } from "@/lib/demo/local-media";
import { demoEventPath } from "@/lib/i18n/routes";
import type { SolutionPageLocale } from "@/lib/i18n/routes";
import type { WeddingConversionCopy } from "./wedding-conversion-copy";

/**
 * The marketing simulator runs the exact guest upload card from the event page,
 * only in local mode: photos, videos and voice messages stay in the browser and
 * show up in the demo gallery on this device.
 */
export function LocalUploadDemo({ copy, locale }: { copy: WeddingConversionCopy; locale: SolutionPageLocale }) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const addedCount = useLocalDemoMedia().length;

  return (
    <div className="local-upload-demo">
      <div className="local-upload-demo__phone">
        <div className="local-upload-demo__topbar" aria-hidden="true"><span /><span /><span /></div>
        <div className="local-upload-demo__stage [&>section]:w-full [&>section]:rounded-2xl [&>section]:border-0 [&>section]:px-0 [&>section]:pt-0 [&>section]:shadow-none">
          <EventUpload
            eventSlug={DEMO_EVENT_SLUG}
            guestId="demo-guest"
            videoUploadsEnabled
            onRequestVoiceMessage={() => setVoiceOpen(true)}
            localOnly
          />
          <VoiceMessageRecorder
            eventSlug={DEMO_EVENT_SLUG}
            guestId="demo-guest"
            onSubmitted={() => undefined}
            hideEntryCard
            open={voiceOpen}
            onOpenChange={setVoiceOpen}
            localOnly
          />
        </div>
        {addedCount > 0 ? (
          <Link className="local-upload-demo__link" href={demoEventPath(locale)}>{copy.uploadDemoLink}</Link>
        ) : (
          <small className="local-upload-demo__privacy">{copy.uploadLocalOnly}</small>
        )}
      </div>
    </div>
  );
}
