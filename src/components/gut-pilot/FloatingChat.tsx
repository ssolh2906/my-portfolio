"use client";

// Fixed-demo version of gut-pilot's live chat dock. The launcher/panel
// chrome is kept — it's one of the real product's two headline features
// alongside the Decision Log — but there's no backend to send a message to
// here, so opening it shows one static line instead of a live conversation.
// Fixed to the viewport (not scoped to the embed card) so it stays reachable
// while scrolling a long step's content, matching the source app's own
// always-visible dock — same tradeoff the source app itself makes.
import { useState } from "react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed right-6 bottom-20 z-20 w-[min(320px,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <b className="text-sm text-slate-900">Ask the reviewer</b>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            In the real app, this chat is connected to each page&rsquo;s live data, the reviewer AI agent, and
            Paperclip&rsquo;s literature search, wired to whichever gate you&rsquo;re on. No live backend is
            attached in this fixed demo, so sending a message here is disabled.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask the reviewer"}
        className="fixed right-6 bottom-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-colors duration-200 hover:bg-blue-700"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M4 4h16v12H8l-4 4V4Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </>
  );
}
