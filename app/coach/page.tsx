"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Body, Header, Screen, SectionLabel } from "@/components/Shell";
import { IconBolt, IconChevronDown } from "@/components/Icons";
import { coachCards, type CoachCard } from "@/lib/coach";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

/**
 * The coach is deterministic. Every card carries the numbers it fired on, so
 * the "Why this suggestion?" panel is the reason a user can trust the card.
 * Nothing here is generated; it renders what lib/coach.ts computed.
 */
export default function CoachPage() {
  // history is in the dependency list so the cards recompute once the store
  // has merged logged sessions over the seed.
  const { history } = useStore();
  const cards = useMemo(() => coachCards(), [history]);

  return (
    <Screen>
      <Header
        back="/"
        title="Coach"
        subtitle="Progression and deload from your own numbers"
      />

      <Body padTop={14} gap={14}>
        {cards.length === 0 ? <EmptyState /> : null}

        {cards.length > 0 ? (
          <>
            <SectionLabel>{cards.length} SUGGESTION{cards.length === 1 ? "" : "S"}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cards.map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          </>
        ) : null}

        <p
          style={{
            fontSize: 11,
            lineHeight: 1.5,
            color: t.textFaint,
            textAlign: "center",
          }}
        >
          Rules, not predictions. A lift is only progressed when every working set
          hit the top of its range across two sessions at RPE 7 or below.
        </p>
      </Body>
    </Screen>
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
            <div
              key={row.label}
              style={{ display: "flex", alignItems: "baseline", gap: 10 }}
            >
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
