import SignInPage from '@/src/features/c01-p0-auth-schema/SignInPage';

export default function Page() {
  // DEMO_PASSWORD has no NEXT_PUBLIC_ prefix — read server-side and pass as a prop.
  // The value ends up in the client bundle only when the env var is present.
  const demoEmail    = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? null;
  const demoPassword = process.env.DEMO_PASSWORD ?? null;
  return <SignInPage demoEmail={demoEmail} demoPassword={demoPassword} />;
}
