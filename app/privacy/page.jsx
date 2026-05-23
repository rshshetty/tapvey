import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Tapvey",
  description: "How Tapvey collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  const S = {
    page: { fontFamily: "'DM Sans',sans-serif", background: "#F5E8CC", minHeight: "100vh", padding: "80px 5% 60px", color: "#1A1008" },
    container: { maxWidth: 720, margin: "0 auto" },
    h1: { fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 36, fontWeight: 700, marginBottom: 8 },
    updated: { fontSize: 14, color: "#6B503A", marginBottom: 40 },
    h2: { fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 22, fontWeight: 700, margin: "36px 0 12px" },
    p: { fontSize: 15, lineHeight: 1.75, color: "#1A1008", margin: "0 0 16px" },
    ul: { fontSize: 15, lineHeight: 1.75, color: "#1A1008", margin: "0 0 16px", paddingLeft: 24 },
    back: { display: "inline-block", marginTop: 32, fontSize: 14, color: "#B07820", textDecoration: "none" },
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <Link href="/" style={S.back}>&larr; Back to Tapvey</Link>
        <h1 style={{ ...S.h1, marginTop: 24 }}>Privacy Policy</h1>
        <p style={S.updated}>Last updated: 23 May 2026</p>

        <h2 style={S.h2}>Who we are</h2>
        <p style={S.p}>Tapvey Technologies Pvt Ltd (&quot;Tapvey&quot;, &quot;we&quot;, &quot;us&quot;) operates tapvey.com. This policy explains how we collect, use, and protect information when you use our website and services.</p>

        <h2 style={S.h2}>What we collect</h2>
        <ul style={S.ul}>
          <li><strong>Waitlist signups:</strong> Restaurant name, email address, phone number (optional), and city/country (optional). Submitted via Web3Forms and delivered to us by email.</li>
          <li><strong>Demo usage:</strong> When you use the live demo, your star rating, selected tags, and optional notes are sent to our server to generate a review using the Google Gemini API. We do not store this data after the response is returned.</li>
          <li><strong>Analytics:</strong> We may use privacy-friendly analytics (no personal data collection) to understand page visits and improve the site.</li>
        </ul>

        <h2 style={S.h2}>How we use your data</h2>
        <ul style={S.ul}>
          <li>To contact you about your waitlist signup and onboard your restaurant.</li>
          <li>To generate AI-powered reviews in the demo (data is not stored).</li>
          <li>To improve our service.</li>
        </ul>

        <h2 style={S.h2}>Third-party services</h2>
        <ul style={S.ul}>
          <li><strong>Web3Forms:</strong> Processes waitlist form submissions. See their <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#B07820" }}>privacy policy</a>.</li>
          <li><strong>Google Gemini API:</strong> Generates review text from your demo inputs. See Google&apos;s <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#B07820" }}>API terms</a>.</li>
        </ul>

        <h2 style={S.h2}>Data retention</h2>
        <p style={S.p}>Waitlist data is retained until we onboard your restaurant or you ask us to delete it. Demo inputs are not stored.</p>

        <h2 style={S.h2}>Your rights</h2>
        <p style={S.p}>You can request access to, correction of, or deletion of your data at any time by emailing <a href="mailto:hello@tapvey.com" style={{ color: "#B07820" }}>hello@tapvey.com</a>.</p>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>For privacy questions, email <a href="mailto:hello@tapvey.com" style={{ color: "#B07820" }}>hello@tapvey.com</a>.</p>

        <Link href="/" style={S.back}>&larr; Back to Tapvey</Link>
      </div>
    </div>
  );
}
