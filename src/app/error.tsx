"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Do not log error details that may include citizen-entered data.
  }, []);

  return (
    <main className="error-shell">
      <section className="error-card" role="alert">
        <div className="error-icon"><AlertTriangle size={22} /></div>
        <p className="error-eyebrow">KENYA CONSULAR-SERVICE PROTOTYPE</p>
        <h1>We couldn’t open this page</h1>
        <p className="error-copy">Your demo session may need a fresh load. Try again, or return to the public welcome page and choose a Kenyan citizen or mission staff preview.</p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={reset}><RefreshCw size={14} /> Try again</button>
          <a className="btn btn-secondary" href="/"><ArrowLeft size={14} /> Return to welcome page</a>
        </div>
        <div className="error-safety"><ShieldAlert size={16} /><div><strong>Immediate danger?</strong><span>This prototype is not monitored and cannot dispatch help. Contact local emergency services or the responsible Kenya mission’s published emergency line using its official source.</span></div></div>
        <a className="error-source" href="https://www.mfa.go.ke/diplomatic-missions" target="_blank" rel="noreferrer">Open the Kenya Ministry of Foreign and Diaspora Affairs mission directory <ExternalLink size={12} /></a>
        <p className="error-foot">No sign-in is required for this fictional demo. Do not enter sensitive information.</p>
      </section>
    </main>
  );
}
