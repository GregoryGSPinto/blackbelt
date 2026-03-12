const MOCK_MODE_ENABLED = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export default function ReviewAccessPage() {
  return (
    <main className="min-h-screen bg-[#120f1a] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <span className="mb-4 inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          Review access
        </span>
        <h1 className="text-3xl font-semibold">Reviewer and demo access</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          This page exists to remove hidden setup from evaluation builds. It documents the supported
          login path, the main areas to inspect, and how to request account deletion or support.
        </p>

        <section className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold">Current access strategy</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            BlackBelt uses a stable reviewer account only in controlled demo builds. The account is
            backed by mock data and is not connected to real customer data.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Mock mode status:{' '}
            <strong className={MOCK_MODE_ENABLED ? 'text-emerald-300' : 'text-rose-300'}>
              {MOCK_MODE_ENABLED ? 'enabled' : 'disabled'}
            </strong>
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Login</h2>
            <p className="mt-3 text-sm text-white/70">
              Reviewer credentials are provisioned out-of-band by operations and should not be
              embedded in the application or repository. Use the credentials provided in the
              release packet or store reviewer notes.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Recommended validation path</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/70">
              <li>Log in through the regular screen.</li>
              <li>Open dashboard, finance, communications, and academy settings.</li>
              <li>Review privacy policy, terms, and account deletion flow.</li>
              <li>Log out and verify session handling.</li>
            </ol>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Support and account deletion</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-3">
            <a className="rounded-2xl bg-black/25 px-4 py-3 hover:bg-black/35" href="/excluir-conta">
              Public account deletion form
            </a>
            <a className="rounded-2xl bg-black/25 px-4 py-3 hover:bg-black/35" href="/politica-privacidade">
              Privacy policy
            </a>
            <a className="rounded-2xl bg-black/25 px-4 py-3 hover:bg-black/35" href="/termos-de-uso">
              Terms of use
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
