import { Shield, Cpu, Link, Phone, FileImage, Type } from 'lucide-react'

const sections = [
  {
    icon: <Type size={17} className="text-red-700" />,
    title: 'Text Analysis',
    description:
      'Paste any suspicious message, email body, or SMS directly. The system reads the raw text and classifies it as phishing or legitimate.',
  },
  {
    icon: <FileImage size={17} className="text-red-700" />,
    title: 'Image Analysis',
    description:
      'Upload a screenshot of a message, letter, or email. OCR extracts the text from the image, then the same classifier is applied.',
  },
  {
    icon: <Cpu size={17} className="text-red-700" />,
    title: 'BERT Classifier',
    description:
      'The core model is bert-large-uncased fine-tuned on a phishing dataset covering URLs, emails, SMS, and websites. It returns a phishing probability score for any input text.',
  },
  {
    icon: <Link size={17} className="text-red-700" />,
    title: 'URL Checks (coming soon)',
    description:
      'Suspicious links found in content will be verified against VirusTotal and WHOIS domain age checks to flag newly registered or known-malicious domains.',
  },
  {
    icon: <Phone size={17} className="text-red-700" />,
    title: 'Phone Verification (coming soon)',
    description:
      'Phone numbers extracted from messages will be checked against carrier and government agency registries to verify whether they belong to a legitimate organization.',
  },
]

export default function AboutPanel() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Shield size={20} className="text-red-700 shrink-0" />
          <h1 className="text-2xl font-bold text-[#e0e0e0] tracking-tight">
            MaliciousCheck
          </h1>
        </div>
        <p className="text-[#888] text-sm leading-relaxed">
          An AI-powered detection system for identifying scams, phishing attempts,
          and social engineering across text messages, emails, and physical letters.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#222]" />

      {/* How it works */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest">
          How it works
        </h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.title}
              className="flex gap-4 p-4 bg-[#161616] border border-[#222] rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-900/30 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[#d4d4d4]">{s.title}</p>
                <p className="text-sm text-[#777] leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#222]" />

      {/* Detection signals */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest">
          What it looks for
        </h2>
        <ul className="space-y-2 text-sm text-[#888]">
          {[
            "Linguistic patterns match known 'Urgent Action' by looking at phishing templates/patterns.",
            'Suspicious URLs — domains impersonating official organizations',
            'Grammar and phrasing anomalies — unusual wording or spelling errors',
            'Unsolicited contact patterns — unexpected requests for personal or financial data',
            'Phone numbers not registered to legitimate organizations',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 items-start">
              <span className="text-red-800 mt-1 shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-[#222]" />

      {/* Model info */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest">
          Model
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Base model', 'bert-large-uncased'],
            ['Parameters', '336M'],
            ['Accuracy', '97.17%'],
            ['Precision', '96.58%'],
            ['Recall', '96.70%'],
            ['License', 'Apache 2.0'],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#161616] border border-[#222] rounded-lg px-4 py-3">
              <p className="text-[#555] text-xs mb-0.5">{label}</p>
              <p className="text-[#d4d4d4] font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
