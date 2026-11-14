"use client";

import { Body, Header, Screen } from "@/components/Shell";
import { IconCheck, IconX } from "@/components/Icons";
import { buildGymContext } from "@/lib/availability";
import { EQUIPMENT, gymById } from "@/lib/catalog";
import { font, t } from "@/lib/tokens";

const GYM = gymById("ut_rec")!;
const ctx = buildGymContext(GYM);

export default function GymPage() {
  return (
    <Screen>
      <Header back="/profile" title={GYM.name} subtitle={GYM.note} />
      <Body padTop={18} gap={16}>
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: "12px 13px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Equipment availability</span>
          <span style={{ fontFamily: font.mono, fontSize: 11.5, color: t.textDim }}>
            {ctx.availableCount} of {ctx.totalCount} exercises available
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {EQUIPMENT.map((item) => {
            const has = GYM.equipment.includes(item.id);
            return (
              <span
                key={item.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 32,
                  padding: "0 11px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 500,
                  background: has ? t.surface : t.surfaceOff,
                  border: `1px solid ${has ? t.border : t.borderSoft}`,
                  color: has ? t.text : t.textFaint,
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

        <span style={{ fontSize: 11, color: t.textFaint, textAlign: "center" }}>
          {EQUIPMENT.length} equipment types tracked · {ctx.missingCount} exercises need kit not here
        </span>
      </Body>
    </Screen>
  );
}
