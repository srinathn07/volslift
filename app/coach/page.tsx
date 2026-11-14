"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Body, Header, Screen, SectionLabel } from "@/components/Shell";
import {
  IconArrowUp,
  IconBolt,
  IconChevronDown,
  IconTrend,
  IconWarning,
} from "@/components/Icons";
import { GOALS, coachCards, type CoachCard } from "@/lib/coach";
import { SEED_HISTORY } from "@/lib/history";
import { font, t } from "@/lib/tokens";

export default function CoachPage() {
  const cards = useMemo(() => coachCards(), []);
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const sessionCount = useMemo(
    () => new Set(SEED_HISTORY.map((s) => new Date(s.performedAt).toDateString())).size,
    [],
  );

  return (
    <Screen>
      <Header
        back="/"
        title="AI Coach"
        subtitle={`Reading your last ${sessionCount} sessions`}
        right={
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: t.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconBolt />
          </div>
        }
      />

      <Body padTop={16} gap={14}>
        <SectionLabel>{cards.length > 0 ? "WHAT YOUR NUMBERS SAY" : "NOTHING TO FLAG"}</SectionLabel>

        {cards.length === 0 ? (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: 16,
              fontSize: 13.5,
              lineHeight: 1.5,
              color: t.textSoft,
            }}
          >
            Nothing to change yet. Log a couple more sessions and the coach will have enough to
            compare.
          </div>
        ) : (
          cards.map((card) => <SuggestionCard key={card.id} card={card} />)
        )}

        {/* Routine generator */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 15,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>Build a routine from a goal</span>
            <span style={{ fontSize: 12.5, color: t.textDim }}>
              Four days a week, 60 minutes, your equipment
            </span>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {GOALS.map((option) => {
              const selected = goal === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGoal(option)}
                  aria-pressed={selected}
                  style={{
                    height: 34,
                    padding: "0 14px",
                    borderRadius: 17,
                    border: `1px solid ${selected ? t.accent : "#2E343A"}`,
                    background: selected ? t.accentSoft : t.surface2,
                    color: selected ? t.accentText : t.textSoft,
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <Link
            href="/routines/new"
            style={{
              height: 46,
              borderRadius: 12,
              background: t.surface2,
              border: `1px solid ${t.borderStrong}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <IconBolt size={16} />
            Generate {goal.toLowerCase()} routine
          </Link>
        </div>

        {/* Composer */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <input
            type="text"
            aria-label="Ask your coach a question"
            placeholder="Ask about form, swaps, soreness…"
            style={{
              flex: 1,
              minWidth: 0,
              height: 48,
              boxSizing: "border-box",
              borderRadius: 14,
              background: t.surface2,
              border: "1px solid #2A2F35",
              color: t.text,
              fontSize: 14,
              padding: "0 14px",
            }}
          />
          <button
            type="button"
            aria-label="Send question"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: t.accent,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <IconArrowUp size={19} color={t.bg} />
          </button>
        </div>

        <span style={{ fontSize: 11, lineHeight: 1.5, color: t.textFaint, textAlign: "center" }}>
          Recommendations come from rules over your logged sets, not a guess. Open any card to see
          the numbers behind it.
        </span>
      </Body>
    </Screen>
  );
}

function SuggestionCard({ card }: { card: CoachCard }) {
  const deload = card.suggestion.kind === "deload";
  const [open, setOpen] = useState(!deload);

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${deload ? "#3A2F20" : t.borderAccent}`,
        borderRadius: 16,
        padding: "15px 15px 13px 15px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: deload ? "rgba(255,178,74,0.12)" : t.successSoft,
            border: `1px solid ${deload ? "#3D3220" : "#22382E"}`,
          }}
        >
          {deload ? (
            <IconWarning size={17} color={t.warning} strokeWidth={2.1} />
          ) : (
            <IconTrend size={17} color={t.success} strokeWidth={2.1} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{card.title}</span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: t.textSoft }}>{card.body}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          padding: 0,
          color: t.textDim,
          fontSize: 12,
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        Why this suggestion?
        <IconChevronDown
          size={13}
          color={t.textDim}
          strokeWidth={2.4}
          style={{
            transition: "transform 150ms ease",
            transform: `rotate(${open ? 180 : 0}deg)`,
          }}
        />
      </button>

      {open ? (
        <div
          style={{
            background: t.surface2,
            borderRadius: 12,
            padding: 12,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {card.evidence.map((row) => (
            <div key={row.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13 }}>
                {row.value}
              </span>
              <span style={{ fontSize: 10.5, color: t.textDim }}>{row.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 9 }}>
        <Link
          href={deload ? "/routines/new" : "/workout"}
          style={{
            flex: 1,
            height: 42,
            borderRadius: 11,
            background: deload ? t.surface2 : t.accent,
            border: deload ? `1px solid ${t.borderStrong}` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.display,
            fontSize: 13.5,
            fontWeight: 700,
            color: deload ? t.text : t.bg,
          }}
        >
          {deload ? "Plan a light week" : "Apply to routine"}
        </Link>
        <button
          type="button"
          style={{
            height: 42,
            padding: "0 16px",
            borderRadius: 11,
            background: "none",
            border: `1px solid ${t.border}`,
            color: t.textDim,
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
