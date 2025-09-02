import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

// ✅ Single-file landing page for a parcel invoice audit product
// CORE PRINCIPLES IMPLEMENTED:
// • Single Call to Action: every button triggers the SAME action (Start Free Scan →)
// • No Navigation Bar: removed to keep focus on the primary action
// • High Contrast: bold, accessible color choices for copy and CTAs
// • Keyword Alignment: H1 can exactly match the ad keyword (see DEFAULT_HEADLINE and ?kw=)
// • Dedicated Keyword Pages: duplicate this file per keyword for best results; ?kw= is provided for testing
// • Hero H1 = exact target keyword to help Google learn precise bidding
// • "Juicy" Buttons: large, high-contrast, ring/hover/active states that clearly indicate the action
// • GTM-ready: pushes events to window.dataLayer
// • Simple ROI calculator
// • Accessible, high-contrast layout

const DEFAULT_HEADLINE = "Parcel Invoice Audit for UPS & FedEx"; // 🔁 Swap to: "Shopify Shipping Invoice Audit" for that ad group
const SUBHEAD =
  "Detect DIM, surcharges, and billing errors automatically. Recover lost margin in days—not quarters.";

// 👉 Replace with your destination (trial/waitlist/demo). Leave as "#" to stay on-page.
const PRIMARY_CTA_HREF = "#signup";

// Helpers
function pushDL(event, payload = {}) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  }
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Calculator() {
  const [shipments, setShipments] = useState(1200);
  const [avgShipCost, setAvgShipCost] = useState(12);
  const [errorRate, setErrorRate] = useState(0.03); // 3%
  const monthlySpend = useMemo(() => shipments * avgShipCost, [shipments, avgShipCost]);
  const potentialRecovery = useMemo(() => monthlySpend * errorRate, [monthlySpend, errorRate]);

  return (
    <section id="roi" className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Estimate your monthly recovery</h2>
          <p className="mt-2 text-slate-600">Adjust your volumes to see how much you could recover from billing errors, DIM, and surcharges.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Monthly shipments</span>
              <input type="number" min={0} value={shipments} onChange={e => setShipments(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-slate-400 focus:outline-none"/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Avg. cost per shipment ($)</span>
              <input type="number" min={0} step={0.01} value={avgShipCost} onChange={e => setAvgShipCost(Number(e.target.value) || 0)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-slate-400 focus:outline-none"/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Estimated error rate</span>
              <input type="range" min={0} max={0.09} step={0.01} value={errorRate} onChange={e => setErrorRate(Number(e.target.value))} className="mt-3 w-full"/>
              <div className="mt-1 text-sm text-slate-600">{Math.round(errorRate * 100)}%</div>
            </label>
          </div>
        </div>
        <div className="grid gap-4">
          <Stat label="Monthly shipping spend" value={monthlySpend.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} />
          <Stat label="Estimated recoverable errors" value={potentialRecovery.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} />
          <a href={PRIMARY_CTA_HREF} onClick={() => pushDL('cta_click', { cta: 'calc_cta' })} className="mt-2 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-7 py-4 text-white shadow-lg hover:bg-black active:scale-[0.99] transition-transform ring-2 ring-transparent hover:ring-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300">
            Start Free Scan →
          </a>
          <div className="text-xs text-slate-500">Estimate only. Actual results depend on carrier mix, surcharges, DIM exposure, and shipping profiles.</div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Connect carriers",
      desc: "Securely connect UPS / FedEx (and DHL/USPS if needed). Read-only access to invoices.",
    },
    {
      title: "Audit automatically",
      desc: "We flag DIM mis-calc, duplicate charges, residential/area surcharges, and late-delivery refunds.",
    },
    {
      title: "Recover and prevent",
      desc: "Export dispute packets or auto-dispute with your carrier rep. Use rules to prevent repeat charges.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How it works</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Step {i + 1}</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{s.title}</div>
            <p className="mt-2 text-slate-600">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { title: "DIM & weight checks", desc: "Spot dimensional weight miscalculations across zones and services." },
    { title: "Surcharge intelligence", desc: "Residential, delivery area, fuel—know what drove the cost." },
    { title: "Duplicate & mismatch", desc: "Detect duplicate labels, wrong rate cards, and weekend fees." },
    { title: "Refund opportunities", desc: "Surface late-delivery and guarantee credits (where applicable)." },
    { title: "Shopify friendly", desc: "Works with Shopify workflows and exports. No theme changes." },
    { title: "Export & API", desc: "Dispute packets, CSV/Sheets, and API access for automation." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Everything you need to claw back margin</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">{f.title}</div>
            <p className="mt-2 text-slate-600">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Do you scrape data?",
      a: "No. We use read-only access to your carrier billing exports or APIs to analyze legitimate invoice data.",
    },
    {
      q: "Is this just for Shopify?",
      a: "It works great for Shopify stores, but any e‑commerce stack can use it. We export clean CSVs and have an API.",
    },
    {
      q: "Will you file disputes for us?",
      a: "You can export dispute packets or automate routing to your carrier rep. Full-service options are available.",
    },
    {
      q: "What carriers do you support?",
      a: "UPS and FedEx to start, with optional DHL/USPS support depending on region and service levels.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">FAQs</h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {items.map((it, i) => (
          <div key={i} className="">
            <button
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <span className="text-base font-semibold text-slate-900">{it.q}</span>
              <span className="ml-4 text-slate-500">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-slate-700">{it.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignupCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    pushDL("signup_submit", { email_domain: email.split("@")[1] || "unknown" });

    try {
      const params = new URLSearchParams(window.location.search);
      const kwFromUrl = (params.get("kw") || "").trim();
      const kw = kwFromUrl || (typeof document !== "undefined" ? document.title.replace(" – SpotCircuit", "") : "");
      const utm = {};
      params.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kw, source: "google_ads", utm })
      });

      if (!res.ok) throw new Error("signup_failed");

      setSubmitted(true);
      pushDL("signup_success", { plan: "trial" });
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div id="signup" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">
        <div className="text-lg font-semibold">You're in!</div>
        <p className="mt-1 text-emerald-800">We'll email you a link to connect your carriers and start your first scan.</p>
      </div>
    );
  }

  return (

      <div id="signup" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">
        <div className="text-lg font-semibold">You're in!</div>
        <p className="mt-1 text-emerald-800">We'll email you a link to connect your carriers and start your first scan.</p>
      </div>
    );
  }

  return (
    <form id="signup" onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Work email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-slate-400 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        onClick={() => pushDL("cta_click", { cta: "signup_primary" })}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-7 py-4 text-white shadow-lg hover:bg-black active:scale-[0.99] transition-transform ring-2 ring-transparent hover:ring-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
      >
        Start Free Scan →
      </button>
      {errorMsg && <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMsg}</div>}
      <div className="mt-2 text-xs text-slate-500">No credit card required • Read‑only billing access</div>
    </form>
  );
}

export default function LandingPage() {
  // Dynamically align the H1 to the exact ad keyword if provided via ?kw=Your+Exact+Keyword
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const kw = params.get("kw");
        const text = (kw || "").trim();
        if (text) {
          setHeadline(text);
          document.title = `${text} – SpotCircuit`;
          pushDL("keyword_alignment", { exact_keyword: text });
        } else {
          document.title = `${DEFAULT_HEADLINE} – SpotCircuit`;
        }
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* HERO */}
      <header className="mx-auto max-w-6xl px-4 pb-12 pt-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{headline}</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-700">{SUBHEAD}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={PRIMARY_CTA_HREF}
                onClick={() => pushDL("cta_click", { cta: "hero_primary" })}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-7 py-4 text-white shadow-lg hover:bg-black active:scale-[0.99] transition-transform ring-2 ring-transparent hover:ring-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                Start Free Scan →
              </a>
              <div className="text-sm text-slate-600">Works with Shopify • UPS • FedEx</div>
            </div>
            <div className="mt-6 grid max-w-xl grid-cols-3 gap-4">
              <Stat label="Avg. billing error" value="1–9%" />
              <Stat label="Setup time" value="< 10 min" />
              <Stat label="Data access" value="Read‑only" />
            </div>
          </div>
          <div>
            <SignupCard />
          </div>
        </motion.div>
      </header>

      {/* SOCIAL PROOF / TRUST */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>Built for e‑commerce ops teams</div>
            <div className="text-slate-400">GDPR-friendly • SOC 2-ready practices • Least-privilege access</div>
          </div>
        </div>
      </section>

      <Calculator />
      <HowItWorks />
      <Features />

      {/* CTA STRIP */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-slate-900 p-8 text-white">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Find refund opportunities and stop repeat fees</h3>
              <p className="mt-2 text-slate-300">Run your first scan in minutes. Export dispute packets or send to your carrier rep.</p>
            </div>
            <div className="sm:text-right">
              <a href={PRIMARY_CTA_HREF} onClick={() => pushDL('cta_click', { cta: 'cta_strip' })} className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 font-semibold text-slate-900 shadow-lg hover:bg-slate-100 active:scale-[0.99] transition-transform ring-2 ring-transparent hover:ring-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">Start Free Scan →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-2 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} SpotCircuit • All rights reserved.</div>
          <div className="flex flex-wrap gap-4">
            <a className="underline-offset-2 hover:underline" href="#">Privacy</a>
            <a className="underline-offset-2 hover:underline" href="#">Terms</a>
            <span className="text-slate-400">This tool analyzes your legitimate carrier invoices. No scraping or unauthorized access.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
