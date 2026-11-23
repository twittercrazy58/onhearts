import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Footer } from '@/components/Footer';
import {
  Heart,
  Camera,
  QrCode,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Download,
} from 'lucide-react';

const EDITORIAL_SHOWCASE = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    alt: 'Newlywed couple smiling together on their wedding day',
    badge: 'Bespoke Digital Invitation',
    caption: 'Share your love story, venue schedule, and countdown on one private link.',
  },
  {
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    alt: 'Wedding guests capturing candid photos of the couple',
    badge: 'Live Guest Camera',
    caption: 'Guests scan your table QR code and upload candid phone photos—no app required.',
  },
  {
    src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
    alt: 'Couple celebrating surrounded by family and friends',
    badge: 'Instant Keepsake Archive',
    caption: 'Every photo and congratulatory wish is preserved for the couple to download anytime.',
  },
];

const SAMPLE_WISHES = [
  {
    quote:
      'Seeing you both step into this new chapter surrounded by so much joy is the greatest gift. Wishing you a lifetime of laughter and peace!',
    author: 'Amaka & Tobi',
    relation: 'Friends of the Couple',
  },
  {
    quote:
      'From your very first date to watching you exchange vows today—may your love continue to grow deeper with every passing year.',
    author: 'Mrs. Folake Adeyemi',
    relation: 'Family',
  },
  {
    quote:
      'What an unforgettable celebration! Thank you for letting us capture and share every dance floor moment with you both.',
    author: 'David & Sarah',
    relation: 'Wedding Guests',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2520]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <BrandLogo size="md" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#7A6F67]">
            <a href="#experience" className="hover:text-[#2C2520] transition">
              The Experience
            </a>
            <a href="#features" className="hover:text-[#2C2520] transition">
              Features
            </a>
            <a href="#guestbook-preview" className="hover:text-[#2C2520] transition">
              Digital Guestbook
            </a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2520] px-5 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#423831] transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#B8925A]" />
            Couple &amp; Admin Studio
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B8925A]/15 px-4 py-1.5 text-xs font-semibold text-[#9A7642] mb-5">
            <Heart className="w-3.5 h-3.5 fill-current" /> Private Digital Wedding Experiences
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your Wedding Invitation, Live Guest Camera &amp; Keepsake Album in One Place.
          </h1>

          <p className="mt-6 text-[#7A6F67] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            OneHearts gives every couple a private, custom-branded wedding hub—complete with event
            schedules, digital guestbook wishes, and instant QR-code photo sharing from every
            guest&apos;s phone.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#B8925A] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#A37F49] transition shadow-sm"
            >
              Open Couple &amp; Admin Studio <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#experience"
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-white px-7 py-3.5 text-sm font-semibold text-[#2C2520] hover:bg-[#FAF8F5] transition"
            >
              Explore How It Works
            </a>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#7A6F67]">
            <Lock className="w-3.5 h-3.5 text-[#B8925A]" />
            <span>
              Every couple&apos;s celebration page is private and accessible only via their personal
              invitation link or table QR code.
            </span>
          </div>
        </section>

        {/* Editorial Visual Showcase (Couples & Guests Snapping Moments) */}
        <section id="experience" className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            {EDITORIAL_SHOWCASE.map((item, idx) => (
              <div
                key={idx}
                className="group rounded-3xl bg-white border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-[4/5] bg-[#EDE6DC] relative overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-[#2C2520]/85 backdrop-blur-sm px-3.5 py-1 text-[11px] font-semibold text-white">
                    {item.badge}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#5C534C] leading-relaxed">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Capabilities */}
        <section id="features" className="border-y border-[#E8DFD3] bg-white/70 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="uppercase tracking-[0.22em] text-xs font-semibold text-[#B8925A]">
                Built For Effortless Celebrations
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2">
                Everything Guests Need, Zero Apps to Install
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6 shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#B8925A]/15 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5 text-[#B8925A]" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Table QR Cards</h3>
                <p className="text-sm text-[#7A6F67] mt-2 leading-relaxed">
                  Print custom QR cards for reception tables so guests scan and start uploading
                  photos in seconds.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6 shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#B8925A]/15 flex items-center justify-center mb-4">
                  <Camera className="w-5 h-5 text-[#B8925A]" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Live Photo Wall</h3>
                <p className="text-sm text-[#7A6F67] mt-2 leading-relaxed">
                  Watch candid moments from the ceremony, reception, and dance floor stream into a
                  shared gallery.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6 shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#B8925A]/15 flex items-center justify-center mb-4">
                  <MessageSquareHeart className="w-5 h-5 text-[#B8925A]" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Digital Guestbook</h3>
                <p className="text-sm text-[#7A6F67] mt-2 leading-relaxed">
                  Collect heartfelt prayers, toasts, and congratulatory notes from loved ones near
                  and far.
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-[#E8DFD3] p-6 shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#B8925A]/15 flex items-center justify-center mb-4">
                  <Download className="w-5 h-5 text-[#B8925A]" />
                </div>
                <h3 className="font-serif text-xl font-semibold">One-Click ZIP Archive</h3>
                <p className="text-sm text-[#7A6F67] mt-2 leading-relaxed">
                  Couples can moderate submissions and download every single guest photo in one
                  organized ZIP file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Guestbook Notes & Wishes Showcase */}
        <section id="guestbook-preview" className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Sparkles className="w-6 h-6 text-[#B8925A] mx-auto mb-3" />
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
              Words &amp; Wishes That Last Forever
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#7A6F67]">
              Alongside candid guest photography, every OneHearts celebration includes a digital
              guestbook where family and friends leave lasting blessings.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SAMPLE_WISHES.map((wish, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-[#E8DFD3] p-7 shadow-sm flex flex-col justify-between"
              >
                <p className="italic text-sm sm:text-base text-[#3E352F] leading-relaxed">
                  &ldquo;{wish.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2C2520]">{wish.author}</span>
                  <span className="font-medium text-[#B8925A]">{wish.relation}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Studio CTA Banner */}
          <div className="mt-16 rounded-3xl bg-[#2C2520] text-[#FAF8F5] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.22em] text-[#B8925A] font-semibold">
                Managing a Celebration?
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold mt-1">
                Sign In to Your OneHearts Studio
              </h3>
              <p className="text-sm text-[#D6CEC2] mt-1.5 max-w-lg">
                Customize your invitation theme, print table QR cards, and download all guest
                memories in one click.
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#B8925A] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#A37F49] transition"
            >
              Enter Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}