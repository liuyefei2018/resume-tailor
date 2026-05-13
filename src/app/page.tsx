import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6">
      {/* Navigation */}
      <nav className="flex items-center justify-between py-6">
        <span className="text-xl font-bold text-slate-800">ResumeTailor ✦</span>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="https://x.com/ye_fei77375" target="_blank" className="hover:text-blue-600 transition-colors">
            X: @ye_fei77375
          </a>
          <a href="mailto:yefei.evil@gmail.com" className="hover:text-blue-600 transition-colors">
            yefei.evil@gmail.com
          </a>
          <Link
            href="/resume/new"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try for Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 md:py-28">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
          Your raw experience.<br />
          <span className="text-blue-600">A polished English resume.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Paste your career history (in any language, any format). Our AI talks with you 
          to dig out your real achievements, then generates a recruiter-ready English resume 
          — no templates, no keyword stuffing.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/resume/new"
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-lg font-medium 
                       hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start Free →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Paste Your Story",
              desc: "Raw bullet points, Chinese notes, messy fragments — doesn't matter. Just dump everything you remember about your career.",
            },
            {
              step: "2",
              title: "Chat with AI",
              desc: "Our coach asks smart questions, one at a time, to surface the achievements and metrics that recruiters actually care about.",
            },
            {
              step: "3",
              title: "Get Your Resume",
              desc: "A polished English resume, formatted for overseas job applications. STAR method, strong verbs, quantified results.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="text-center p-6 rounded-xl bg-white border border-slate-100 shadow-sm"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why different */}
      <section className="py-16 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-3">
          Not another resume template tool
        </h2>
        <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
          The hard part of resume writing isn't formatting — it's articulating your impact.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            ["AI Conversation", "Instead of filling a form, you talk through your experience. AI digs into the details you'd never think to include."],
            ["Quantified Results", "Every bullet gets pushed to have numbers. 'Improved performance' → 'Reduced API latency by 60%'."],
            ["Recruiter-Optimized", "Built for overseas job markets (US, EU, SG). Strong action verbs, ATS-friendly, no AI-isms."],
            ["Multi-Language Input", "Chinese raw notes? Fragments? Stream of consciousness? The Parser handles it all."],
          ].map(([title, desc]) => (
            <div key={title} className="p-5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Ready to make your resume stand out?
        </h2>
        <p className="text-slate-500 mb-8">
          Free to try. No account needed.
        </p>
        <Link
          href="/resume/new"
          className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-lg font-medium 
                     hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Try for Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
        Powered by DeepSeek. Built by an indie maker in Beijing.
      </footer>
    </main>
  );
}
