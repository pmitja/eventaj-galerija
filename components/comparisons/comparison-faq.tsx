"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ComparisonFaq({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <Accordion className="compare-accordion" type="single" collapsible>
      {items.map(([question, answer], index) => (
        <AccordionItem key={question} value={`question-${index + 1}`}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
