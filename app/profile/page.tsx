"use client";

import Link from "next/link";
import { useState } from "react";
import { Body, Screen, SectionLabel } from "@/components/Shell";
import { IconChevronRight, IconPin, IconSliders, IconUser } from "@/components/Icons";
import { clearAll } from "@/lib/db";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

export default function ProfilePage() {
  const { gym, gymCtx, availableOnly, setAvailableOnly } = useStore();
  const [cleared, setCleared] = useState(false);

  return (
    <Screen tabBar>
      <Body padTop={44} gap={18}>
        <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 23 }}>
          Profile
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: t.surface2,
              border: "1px solid #2A2F35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconUser size={22} color={t.textDim} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 15.5, fontWeight: 600 }}>Signed out</span>
            <span style={{ fontSize: 12, color: t.textDim }}>
              Sessions are saved on this device until you sign in
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <SectionLabel>TRAINING</SectionLabel>

          <Link
            href="/gym"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "12px 13px",
            }}
          >
            <IconPin size={17} color={t.accent} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Gym</span>
              <span style={{ fontSize: 11.5, color: t.textDim }}>
                {gym.name} · {gymCtx.availableCount} of {gymCtx.totalCount} exercises
              </span>
            </div>
            <IconChevronRight size={16} color="#565C63" />
          </Link>

          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            role="switch"
            aria-checked={availableOnly}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "12px 13px",
              textAlign: "left",
              width: "100%",
            }}
          >
            <IconSliders size={17} color={t.textDim} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Only show available exercises</span>
              <span style={{ fontSize: 11.5, color: t.textDim }}>
                {availableOnly ? "On" : "Off, unavailable ones are marked"}
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

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <SectionLabel>DATA</SectionLabel>
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "12px 13px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12.5, lineHeight: 1.5, color: t.textDim }}>
              Workouts are written to this device first and pushed up when there is signal, so a set
              is never lost to a dead bar of service.
            </span>
            <button
              type="button"
              onClick={async () => {
                await clearAll();
                setCleared(true);
              }}
              style={{
                height: 42,
                borderRadius: 11,
                background: "none",
                border: `1px solid ${t.borderStrong}`,
                color: cleared ? t.textDim : t.warning,
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              {cleared ? "Local data cleared" : "Clear local data"}
            </button>
          </div>
        </div>
      </Body>
    </Screen>
  );
}
