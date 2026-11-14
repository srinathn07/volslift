"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Body, Header, Screen, SectionLabel } from "@/components/Shell";
import { IconBolt, IconChevronDown } from "@/components/Icons";
import { coachCards, type CoachCard } from "@/lib/coach";
import { buildCoachContext } from "@/lib/coachContext";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

/**
 * Two ways into the same numbers.
 *
 * Suggestions is the deterministic coach: rules that fire on your logged
 * training and carry the figures they fired on. Ask is the same data read
 * aloud, for questions a card cannot anticipate. Neither one invents a
 * number; the chat is handed figures already computed by the functions the
 * other screens render from.
 */

type Tab = "suggestions" | "ask";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Why has my bench stalled?",
  "Am I ready to add weight to anything?",
  "What should I focus on next week?",
];

export default function CoachPage() {
  const [tab, setTab] = useState<Tab>("suggestions");

  return (
    <Screen>
      <Header
        back="/"
        title="Coach Smokey"
        subtitle="Progression and deload from your own numbers"
      />

      <div
        role="tablist"
        aria-label="Coach views"
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 16px 0",
          flexShrink: 0,
        }}
      >
        <TabButton active={tab === "suggestions"} onClick={() => setTab("suggestions")}>
          Suggestions
        </TabButton>
        <TabButton active={tab === "ask"} onClick={() => setTab("ask")}>
          Ask
        </TabButton>
      </div>

      {tab === "suggestions" ? <SuggestionsTab /> : <AskTab />}
    </Screen>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        height: 38,
        borderRadius: 11,
        border: `1px solid ${active ? t.accent : t.border}`,
        background: active ? t.accentSoft : t.surface,
        color: active ? t.accent : t.textDim,
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}

/* ── Suggestions ──────────────────────────────────────────────────────────── */

function SuggestionsTab() {
  const { history } = useStore();
  const cards = useMemo(() => coachCards(), [history]);

  return (
    <Body padTop={14} gap={14}>
      {cards.length === 0 ? <EmptyState /> : null}

      {cards.length > 0 ? (
        <>
          <SectionLabel>
            {cards.length} SUGGESTION{cards.length === 1 ? "" : "S"}
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cards.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        </>
      ) : null}

      <p style={{ fontSize: 11, lineHeight: 1.5, color: t.textFaint, textAlign: "center" }}>
        Rules, not predictions. A lift is only progressed when every working set
        hit the top of its range across two sessions at RPE 7 or below.
      </p>
    </Body>
  );
}

function Card({ card }: { card: CoachCard }) {
  const [open, setOpen] = useState(false);
  const deload = card.suggestion.kind === "deload";
  const tint = deload ? t.warning : t.accent;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 11, padding: "13px 13px 0 13px" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: t.surface2,
            border: `1px solid ${tint}`,
          }}
        >
          <IconBolt size={17} color={tint} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{card.title}</span>
          <span style={{ fontSize: 12.5, lineHeight: 1.45, color: t.textSoft }}>{card.body}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          background: "none",
          border: "none",
          padding: "11px 13px",
          textAlign: "left",
          color: t.textDim,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span style={{ flex: 1 }}>Why this suggestion?</span>
        <IconChevronDown
          size={13}
          color={t.textFaint}
          style={{
            transition: "transform 150ms ease",
            transform: `rotate(${open ? 180 : 0}deg)`,
          }}
        />
      </button>

      {open ? (
        <div style={{ padding: "0 13px 13px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ height: 1, background: t.divider }} />
          {card.evidence.map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 11.5, color: t.textDim, flex: 1, minWidth: 0 }}>
                {row.label}
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: t.text }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
      }}
    >
      <span style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>
        Nothing to call yet
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.5, color: t.textDim, maxWidth: 260 }}>
        A lift needs two sessions against a known rep range before the coach will
        move it. Run a routine and the cards appear here.
      </span>
      <Link
        href="/"
        style={{
          height: 42,
          padding: "0 20px",
          borderRadius: 12,
          marginTop: 4,
          background: t.accent,
          color: t.bg,
          display: "flex",
          alignItems: "center",
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Start a workout
      </Link>
    </div>
  );
}

/* ── Ask ──────────────────────────────────────────────────────────────────── */

function AskTab() {
  const { history } = useStore();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, pending]);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    const priorTurns = turns;
    setTurns([...priorTurns, { role: "user", content: q }]);
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          // Built here, not on the server: the history lives in this browser.
          context: buildCoachContext() ?? "",
          history: priorTurns,
        }),
      });
      const data = (await res.json()) as { answer: string };
      setTurns((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "That did not go through. Your numbers are still on the Suggestions tab.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const hasData = history.length > 0;

  return (
    <Body padTop={14} gap={12}>
      {turns.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: t.textDim }}>
            Ask about your own training. Answers come from your logged sessions
            and the rules on the Suggestions tab, so every figure quoted is one
            the app computed.
          </p>
          {hasData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  style={{
                    textAlign: "left",
                    padding: "11px 13px",
                    borderRadius: 12,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    color: t.text,
                    fontSize: 13.5,
                    fontFamily: "inherit",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: t.textFaint }}>
              Nothing is logged yet, so there is nothing to read. Run a workout
              first.
            </p>
          )}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {turns.map((turn, i) => (
          <Bubble key={i} turn={turn} />
        ))}
        {pending ? (
          <span style={{ fontSize: 12.5, color: t.textFaint, padding: "2px 2px" }}>
            Reading your training…
          </span>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your training…"
          aria-label="Ask about your training"
          style={{
            flex: 1,
            minWidth: 0,
            height: 46,
            boxSizing: "border-box",
            borderRadius: 13,
            background: t.surface,
            border: `1px solid ${t.border}`,
            color: t.text,
            fontSize: 14,
            fontFamily: "inherit",
            padding: "0 14px",
          }}
        />
        <button
          type="submit"
          disabled={pending || draft.trim().length === 0}
          style={{
            height: 46,
            padding: "0 18px",
            borderRadius: 13,
            border: "none",
            background: draft.trim().length === 0 ? t.surface2 : t.accent,
            color: draft.trim().length === 0 ? t.textFaint : t.bg,
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          Ask
        </button>
      </form>
    </Body>
  );
}

function Bubble({ turn }: { turn: Turn }) {
  const mine = turn.role === "user";
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "88%",
        background: mine ? t.accentSoft : t.surface,
        border: `1px solid ${mine ? t.borderAccent : t.border}`,
        borderRadius: 14,
        padding: "10px 13px",
        fontSize: 13.5,
        lineHeight: 1.5,
        color: t.text,
        whiteSpace: "pre-wrap",
      }}
    >
      {turn.content}
    </div>
  );
}
