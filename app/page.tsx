import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">AF</div>
            <span className="font-semibold text-lg tracking-tight">ActionForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 mb-6">
          Highest-ROI meeting follow-through tool for 2026
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Turn any meeting transcript into{' '}
          <span className="text-brand-600">assignable action items</span>
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
          Paste a transcript. Get structured tasks with owners, deadlines, priorities, and source quotes — ready to push to Notion, Slack, or Linear in one click.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-brand-700 transition"
          >
            Generate Your First Action Items — Free
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            See How It Works
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">No credit card required · 5 free meetings</p>
      </section>

      {/* Social proof / value */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-brand-600">15–40 min</div>
            <p className="mt-2 text-slate-600">saved after every meeting</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-600">Zero</div>
            <p className="mt-2 text-slate-600">dropped commitments</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-600">1 click</div>
            <p className="mt-2 text-slate-600">export to your tools</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How ActionForge works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mx-auto text-lg">1</div>
            <h3 className="mt-4 font-semibold text-lg">Paste or upload transcript</h3>
            <p className="mt-2 text-slate-600 text-sm">Works with Otter, Fireflies, Fathom, Zoom, or any text you paste.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mx-auto text-lg">2</div>
            <h3 className="mt-4 font-semibold text-lg">AI extracts structured actions</h3>
            <p className="mt-2 text-slate-600 text-sm">Task · Owner · Deadline · Priority · Source quote — clean and assignable.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mx-auto text-lg">3</div>
            <h3 className="mt-4 font-semibold text-lg">Export & follow through</h3>
            <p className="mt-2 text-slate-600 text-sm">Copy, CSV, Markdown, or push to Notion / Slack / Linear.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Stop losing action items. Start shipping them.</h2>
          <p className="mt-4 text-brand-100 text-lg">Join the operators who never drop a commitment again.</p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-lg hover:bg-brand-50 transition"
          >
            Start Free — No Card Required
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white text-xs font-bold">AF</div>
            <span>ActionForge</span>
          </div>
          <p>Built for operators who value follow-through.</p>
        </div>
      </footer>
    </div>
  );
}