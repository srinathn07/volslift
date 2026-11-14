"use client";

import Link from "next/link";
import { useState } from "react";
import { Body, Header, Screen, SectionLabel } from "@/components/Shell";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconDumbbell,
  IconPlus,
  IconSearch,
  IconSliders,
  IconSwap,
  IconX,
} from "@/components/Icons";
import { buildGymContext, substituteFor } from "@/lib/availability";
import { EQUIPMENT, EXERCISES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";
import type { Gym } from "@/lib/types";

export default function GymPage() {
  const { gyms, gymId, setGymId, availableOnly, setAvailableOnly } = useStore();
  const [open, setOpen] = useState<string | null>(gymId);
  const [rulesOpen, setRulesOpen] = useState(false);

  const selectedCtx = buildGymContext(gyms.find((g) => g.id === gymId) ?? gyms[0]);

  const onGymTap = (gym: Gym) => {
    if (gym.id === gymId && open === gym.id) {
      setOpen(null);
      return;
    }
    setGymId(gym.id);
    setOpen(gym.id);
  };

  return (
    <Screen>
      <Header back="/" title="Your Gym" subtitle="Tap a gym to pick it and see its kit"
        right={
          <button
            type="button"
            aria-label="Add a gym"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.surface2,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <IconPlus size={18} color={t.accent} />
          </button>
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            height: 40,
            borderRadius: 12,
            background: t.surface2,
            border: `1px solid ${t.border}`,
            padding: "0 12px",
          }}
        >
          <IconSearch size={16} color={t.textDim} />
          <input
            type="search"
            aria-label="Search gyms near you"
            placeholder="Search gyms near you"
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              color: t.text,
              fontSize: 14,
              padding: 0,
            }}
          />
        </div>
      </Header>

      <Body padTop={14} gap={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>SAVED GYMS</SectionLabel>
          {gyms.map((gym) => {
            const selected = gym.id === gymId;
            const expanded = open === gym.id;
            const ctx = buildGymContext(gym);
            const missingSwaps = EXERCISES.filter((e) => !ctx.availableIds.has(e.id))
              .map((e) => ({ from: e, to: substituteFor(e, ctx) }))
              .filter((pair) => pair.to)
              .slice(0, 2);

            return (
              <div
                key={gym.id}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  background: selected ? "rgba(255,90,60,0.07)" : t.surface,
                  border: `1px solid ${selected ? t.accent : t.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => onGymTap(gym)}
                  aria-expanded={expanded}
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
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selected ? "rgba(255,90,60,0.16)" : t.surface2,
                      border: `1px solid ${selected ? "#3A2520" : "#2A2F35"}`,
                    }}
                  >
                    <IconDumbbell size={17} color={selected ? t.accent : t.textDim} />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{gym.name}</span>
                    <span style={{ fontFamily: font.mono, fontSize: 10.5, color: t.textDim }}>
                      {gym.note} · {ctx.availableCount}/{ctx.totalCount} exercises
                    </span>
                  </div>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selected ? t.accent : "transparent",
                      border: `1.5px solid ${selected ? t.accent : "#3A4046"}`,
                    }}
                  >
                    {selected ? <IconCheck size={12} color={t.bg} strokeWidth={3.4} /> : null}
                  </div>
                  <IconChevronDown
                    size={14}
                    color={t.textFaint}
                    style={{
                      transition: "transform 150ms ease",
                      transform: `rotate(${expanded ? 180 : 0}deg)`,
                    }}
                  />
                </button>

                {expanded ? (
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
                          {ctx.missingCount} exercises need kit this gym does not have.{" "}
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
                ) : null}
              </div>
            );
          })}
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
                  ? `Hiding ${selectedCtx.missingCount} unavailable exercises`
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
                      ? `The picker hides what ${selectedCtx.gym.name} cannot do`
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
