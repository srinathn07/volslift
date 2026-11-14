"use client";

import Link from "next/link";
import { Header, Screen, Body } from "@/components/Shell";
import { IconBolt } from "@/components/Icons";
import { font, t } from "@/lib/tokens";

export default function CoachPage() {
  return (
    <Screen>
      <Header back="/" title="AI Coach" subtitle="Powered by your logged data" />
      <Body padTop={48} gap={18}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
          padding: "24px 0",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: t.accentSoft, border: `1px solid ${t.borderAccent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconBolt size={34} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
            <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22 }}>
              Coming Soon
            </span>
            <span style={{ fontSize: 14, color: t.textDim, lineHeight: 1.5, maxWidth: 280 }}>
              The AI Coach will analyze your logged sets and suggest when to add weight, when to deload, and how to structure your week.
            </span>
          </div>
          <div style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: "14px 16px", width: "100%", boxSizing: "border-box",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>What it will do</span>
            {[
              "Flag lifts ready for a weight increase",
              "Detect overreaching before it becomes an injury",
              "Suggest deload weeks based on your RPE trend",
              "Match recommendations to your logged equipment",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span style={{ color: t.accent, fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>·</span>
                <span style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/"
            style={{
              height: 46, padding: "0 24px", borderRadius: 13,
              background: t.accent, color: "#FFFFFF",
              display: "flex", alignItems: "center",
              fontFamily: font.display, fontWeight: 700, fontSize: 15,
            }}
          >
            Back to Home
          </Link>
        </div>
      </Body>
    </Screen>
  );
}
