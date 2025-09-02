"use client";

export const dynamic = 'force-dynamic';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/OptimizedImage";
import { assets } from "@/config/assets";
import LogoHeader from "@/components/LogoHeader";

const DEFAULT_HEADLINE = "Parcel Invoice Audit for UPS & FedEx";
const SUBHEAD = "Detect DIM, surcharges, and billing errors automatically. Recover lost margin in days—not quarters.";
const PRIMARY_CTA_HREF = "/auth/signup";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function pushDL(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  }
}


function Stat({ label, value }: { label: string; value: string }) {
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
  const [errorRate, setErrorRate] = useState(0.03);
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
          {/* ROI Calculator visual on mobile, hidden on desktop */}
          <div className="block sm:hidden mb-4">
            <OptimizedImage
              src={assets.screenshots.roiCalculator.png}
              alt="ROI Calculator showing potential savings"
              className="rounded-2xl shadow-lg w-full"
              sizes="(max-width: 640px) 100vw"
            />
          </div>
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
      icon: assets.logos.carrierIntegration.png,
    },
    {
      title: "Audit automatically",
      desc: "We flag DIM mis-calc, duplicate charges, residential/area surcharges, and late-delivery refunds.",
      icon: assets.icons.automation.png,
    },
    {
      title: "Recover and prevent",
      desc: "Export dispute packets or auto-dispute with your carrier rep. Use rules to prevent repeat charges.",
      icon: assets.screenshots.savingsChart.png,
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl text-center">How it works</h2>
      {/* Process flow image for mobile */}
      <div className="mt-8 block sm:hidden">
        <OptimizedImage
          src={assets.screenshots.processFlow.png}
          alt="3-step process: Connect, Audit, Recover"
          className="rounded-2xl shadow-lg mx-auto"
          sizes="(max-width: 640px) 100vw"
        />
      </div>
      {/* Cards for desktop */}
      <div className="mt-8 hidden sm:grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 w-16 h-16">
              <OptimizedImage
                src={s.icon}
                alt={`${s.title} icon`}
                className="w-full h-full object-contain"
                sizes="64px"
              />
            </div>
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
    { 
      title: "DIM & weight checks", 
      desc: "Spot dimensional weight miscalculations across zones and services.",
      image: assets.screenshots.dimDetection.png
    },
    { 
      title: "Surcharge intelligence", 
      desc: "Residential, delivery area, fuel—know what drove the cost.",
      image: assets.screenshots.invoiceComparison.png
    },
    { title: "Duplicate & mismatch", desc: "Detect duplicate labels, wrong rate cards, and weekend fees." },
    { title: "Refund opportunities", desc: "Surface late-delivery and guarantee credits (where applicable)." },
    { title: "Shopify friendly", desc: "Works with Shopify workflows and exports. No theme changes." },
    { 
      title: "Export & API", 
      desc: "Dispute packets, CSV/Sheets, and API access for automation.",
      image: assets.icons.export.png
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl text-center mb-4">Everything you need to claw back margin</h2>
      
      {/* Featured images showcase on mobile and desktop */}
      <div className="grid gap-4 mb-8 sm:grid-cols-2">
        <div className="relative">
          <OptimizedImage
            src={assets.screenshots.dimDetection.png}
            alt="DIM Error Detection showing weight discrepancies"
            className="rounded-2xl shadow-xl w-full"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">DIM Error Detection</p>
          </div>
        </div>
        <div className="relative">
          <OptimizedImage
            src={assets.screenshots.invoiceComparison.png}
            alt="Before and after invoice comparison showing savings"
            className="rounded-2xl shadow-xl w-full"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Invoice Comparison</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {f.image && (
              <div className="mb-4 w-12 h-12">
                <OptimizedImage
                  src={f.image}
                  alt={`${f.title} icon`}
                  className="w-full h-full object-contain"
                  sizes="48px"
                />
              </div>
            )}
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

export default function LandingPage() {
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
      <header className="mx-auto max-w-6xl px-4 pb-12 pt-16">
        <LogoHeader size="large" opacity={80} />
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
          <div className="relative">
            {/* Dashboard preview image - visible on larger screens, stacked on mobile */}
            <div className="mb-6 lg:mb-0">
              <OptimizedImage
                src={assets.screenshots.dashboard.png}
                alt="SpotCircuit Dashboard showing invoice audit results"
                className="rounded-2xl shadow-2xl border border-slate-200"
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>
          </div>
        </motion.div>
      </header>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">Built for e‑commerce ops teams</div>
            <div className="flex items-center gap-4">
              <OptimizedImage
                src={assets.trust.securityBadges.png}
                alt="SOC 2, GDPR, and Read-Only Access badges"
                className="w-full max-w-md h-auto object-contain"
                sizes="400px"
              />
            </div>
          </div>
        </div>
      </section>

      <Calculator />
      <HowItWorks />
      <Features />
      <FAQ />

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