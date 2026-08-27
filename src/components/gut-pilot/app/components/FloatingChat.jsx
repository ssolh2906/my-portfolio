// FloatingChat.jsx — fixed-demo version of gut-pilot's live chat dock.
// The real app's launcher/panel chrome is kept (so the page still shows off
// that surface), but there is no backend to send a message to here: opening
// it shows one static line explaining what it does in the real app, instead
// of a live conversation. See app/client/src/components/FloatingChat.jsx in
// the source repo for the live version this replaces.
import { useEffect, useState } from "react";

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16v12H8l-4 4V4Z" strokeLinejoin="round" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className={"chat-panel" + (open ? " open" : "")} role="dialog" aria-label="Ask the reviewer" aria-modal="false">
        <div className="chat-panel-head">
          <div>
            <b>Ask the reviewer</b>
            <span>Fixed demo</span>
          </div>
        </div>

        <div className="chat-panel-body">
          <p className="chat-empty">
            In the real app, this chat is connected to each page&rsquo;s live data, the reviewer AI agent, and
            Paperclip&rsquo;s literature search — wired to whichever gate you&rsquo;re on. No live backend is
            attached in this fixed demo, so sending a message here is disabled.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="chat-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask the reviewer"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDownIcon /> : <ChatIcon />}
      </button>
    </>
  );
}
