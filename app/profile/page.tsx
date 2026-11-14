"use client";

import { useState } from "react";
import { Body, Screen, SectionLabel } from "@/components/Shell";
import { IconPin, IconSliders, IconUser } from "@/components/Icons";
import { clearAll } from "@/lib/db";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

export default function ProfilePage() {
  const { gym, gymCtx, availableOnly, setAvailableOnly,
          authUser, syncStatus, signIn, signUp, signOut } = useStore();
  const [cleared, setCleared]     = useState(false);
  const [mode, setMode]           = useState<"signin" | "signup">("signin");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const err = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setAuthLoading(false);
    if (err) setAuthError(err);
    else { setEmail(""); setPassword(""); }
  };

  const syncLabel =
    syncStatus === "syncing" ? "Syncing…" :
    syncStatus === "error"   ? "Sync failed" :
    "Up to date";
  const syncColor =
    syncStatus === "syncing" ? t.textDim :
    syncStatus === "error"   ? t.warning :
    t.success;

  return (
    <Screen tabBar>
      <Body padTop={44} gap={18}>
        <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 23 }}>
          Profile
        </h1>

        {/* Account card */}
        {authUser ? (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: t.accentSoft,
                  border: `1px solid ${t.borderAccent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconUser size={22} color={t.accent} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }} title={authUser.email}>
                  {authUser.email}
                </span>
                <span style={{ fontFamily: font.mono, fontSize: 11.5, color: syncColor }}>
                  {syncLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              style={{
                height: 40,
                borderRadius: 11,
                background: "none",
                border: `1px solid ${t.borderStrong}`,
                fontSize: 13.5,
                fontWeight: 600,
                color: t.textSoft,
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconUser size={22} color={t.textDim} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15.5, fontWeight: 600 }}>
                  {mode === "signin" ? "Sign in" : "Create account"}
                </span>
                <span style={{ fontSize: 12, color: t.textDim }}>
                  Sync workouts across devices
                </span>
              </div>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              style={{
                height: 46,
                borderRadius: 11,
                background: t.bg,
                border: `1px solid ${t.border}`,
                padding: "0 13px",
                fontSize: 15,
                color: t.text,
                fontFamily: font.body,
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                height: 46,
                borderRadius: 11,
                background: t.bg,
                border: `1px solid ${t.border}`,
                padding: "0 13px",
                fontSize: 15,
                color: t.text,
                fontFamily: font.body,
                boxSizing: "border-box",
              }}
            />

            {authError && (
              <span style={{ fontSize: 12.5, color: t.warning }}>{authError}</span>
            )}

            <button
              type="button"
              onClick={() => void handleAuth()}
              disabled={authLoading || !email || !password}
              style={{
                height: 46,
                borderRadius: 11,
                background: authLoading || !email || !password ? t.surface2 : t.accent,
                border: "none",
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 15,
                color: authLoading || !email || !password ? t.textFaint : t.bg,
              }}
            >
              {authLoading
                ? "…"
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setAuthError(null); }}
              style={{
                background: "none",
                border: "none",
                fontSize: 12.5,
                color: t.accentText,
                fontWeight: 600,
                padding: 0,
                textAlign: "center",
              }}
            >
              {mode === "signin"
                ? "No account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <SectionLabel>TRAINING</SectionLabel>

          <div
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
          </div>

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
                background: availableOnly ? t.accent : t.border,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: availableOnly ? t.bg : t.surface,
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
