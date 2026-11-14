"use client";

import Link from "next/link";
import { useState } from "react";
import { Body, Header, Screen, SectionLabel } from "@/components/Shell";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconDumbbell,
  IconSliders,
  IconSwap,
  IconX,
} from "@/components/Icons";
import { substituteFor } from "@/lib/availability";
import { EQUIPMENT, EXERCISES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

/**
 * One gym in this release, so this screen is not a picker. It shows what the
 * gym can load, what it cannot, and what the picker does about it. The
 * equipment list is the visible form of the gating rule, which is why it is
 * here rather than buried in settings.
 */
export default function GymPage() {
  const { gym, gymCtx, availableOnly, setAvailableOnly } = useStore();
  const [rulesOpen, setRulesOpen] = useState(false);

  const missingSwaps = EXERCISES.filter((e) => !gymCtx.availableIds.has(e.id))
    .map((e) => ({ from: e, to: substituteFor(e, gymCtx) }))
    .filter((pair) => pair.to)
    .slice(0, 2);

  return (
    <Screen>
      <Header
        back="/"
        title="Your Gym"
        subtitle="What this gym can load, and what it swaps"
      />

      <Body padTop={14} gap={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>CURRENT GYM</SectionLabel>

          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,90,60,0.07)",
              border: `1px solid ${t.accent}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,90,60,0.16)",
                  border: "1px solid #3A2520",
                }}
              >
                <IconDumbbell size={17} color={t.accent} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{gym.name}</span>
                <span style={{ fontFamily: font.mono, fontSize: 10.5, color: t.textDim }}>
                  {gym.note} · {gymCtx.availableCount}/{gymCtx.totalCount} exercises
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "0 12px 12px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <span style={{ height: 1, background: t.divider }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EQUIPMENT.map((item) => {
                  const has = gym.equipment.includes(item.id);
                  return (
                    <span
                      key={item.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        height: 28,
                        padding: "0 9px",
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 500,
                        background: has ? t.surface2 : "transparent",
                        border: `1px solid ${has ? "#2A2F35" : "#23282D"}`,
                        color: has ? "#E4E7EA" : t.textFaint,
                        textDecoration: has ? "none" : "line-through",
                      }}
                    >
                      {has ? (
                        <IconCheck size={11} color={t.success} strokeWidth={3.2} />
                      ) : (
                        <IconX size={11} color={t.textFaint} strokeWidth={3} />
                      )}
                      {item.name}
                    </span>
                  );
                })}
              </div>

              {missingSwaps.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <IconSwap size={14} color={t.warning} style={{ marginTop: 2 }} />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 11.5,
                      lineHeight: 1.45,
                      color: "#9AA1A8",
                    }}
                  >
                    {gymCtx.missingCount} exercises need kit this gym does not have.{" "}
                    {missingSwaps
                      .map((pair) => `${pair.from.name} swaps to ${pair.to?.name}`)
                      .join(", ")}
                    .
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 11.5, color: t.textDim }}>
                  Everything in the library is available here.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Picker rules */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setRulesOpen((v) => !v)}
            aria-expanded={rulesOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              width: "100%",
              background: "none",
              border: "none",
              padding: "11px 12px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: t.surface2,
                border: "1px solid #2A2F35",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconSliders size={16} color={t.textDim} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Picker rules</span>
              <span style={{ fontSize: 11, color: t.textDim }}>
                {availableOnly
                  ? `Hiding ${gymCtx.missingCount} unavailable exercises`
                  : "Showing all, unavailable ones marked"}
              </span>
            </div>
            <IconChevronDown
              size={14}
              color={t.textFaint}
              style={{
                transition: "transform 150ms ease",
                transform: `rotate(${rulesOpen ? 180 : 0}deg)`,
              }}
            />
          </button>

          {rulesOpen ? (
            <div
              style={{ padding: "0 12px 12px 12px", display: "flex", flexDirection: "column", gap: 9 }}
            >
              <span style={{ height: 1, background: t.divider }} />
              <button
                type="button"
                onClick={() => setAvailableOnly(!availableOnly)}
                role="switch"
                aria-checked={availableOnly}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                    Only show available exercises
                  </span>
                  <span style={{ fontSize: 11.5, lineHeight: 1.4, color: t.textDim }}>
                    {availableOnly
                      ? `The picker hides what ${gym.name} cannot do`
                      : "Unavailable exercises stay visible but marked"}
                  </span>
                </div>
                <span
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 13,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: 3,
                    boxSizing: "border-box",
                    justifyContent: availableOnly ? "flex-end" : "flex-start",
                    background: availableOnly ? t.accent : "#2A2F35",
                    transition: "background 150ms ease",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: availableOnly ? t.bg : t.textDim,
                    }}
                  />
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <Link
          href="/exercises"
          style={{
            height: 48,
            borderRadius: 13,
            background: t.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: font.display,
            fontSize: 15,
            fontWeight: 700,
            color: t.bg,
          }}
        >
          Browse exercises here
          <IconChevronRight size={17} color={t.bg} strokeWidth={2.4} />
        </Link>

        <span style={{ fontSize: 11, color: t.textFaint, textAlign: "center" }}>
          {EQUIPMENT.length} kinds of kit tracked across {EXERCISES.length} exercises
        </span>
      </Body>
    </Screen>
  );
}
