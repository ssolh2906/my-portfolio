// Temporary preview route for the gut-pilot port — NOT the final case-study
// page (that's /projects/gut-pilot, built once more steps are ported).
// Renders the real GutPilotEmbed component full-width on a plain background
// so it can be eyeballed against the source app without the rest of the
// project page's copy/hero around it yet.
import GutPilotEmbed from "@/components/gut-pilot/GutPilotEmbed";

export default function GutPilotTestPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <GutPilotEmbed />
      </div>
    </div>
  );
}
