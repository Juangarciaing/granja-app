import Link from "next/link";

import {
  CycleHeartIcon,
  MilkDropIcon,
  ScaleIcon,
  SowIcon,
} from "@/components/icons/ModuleIcons";
import { getLandingCtas } from "@/lib/landing/cta";
import { createClient } from "@/lib/supabase/server";

const BENEFITS = [
  {
    title: "Cerdas reproductoras",
    description:
      "Nunca más perdés la cuenta de un parto: el alimento diario de cada camada se calcula solo.",
    Icon: SowIcon,
  },
  {
    title: "Cerdos de engorde",
    description:
      "Sabés exactamente cuándo un lote está listo para vender, sin adivinar a ojo el peso.",
    Icon: ScaleIcon,
  },
  {
    title: "Vacas lecheras",
    description:
      "Producción diaria por vaca, para detectar una baja de leche antes de que te cueste plata.",
    Icon: MilkDropIcon,
  },
  {
    title: "Control reproductivo",
    description:
      "Te avisa cuándo esperar el próximo celo, para no perder ciclos por no anotarlo a tiempo.",
    Icon: CycleHeartIcon,
  },
] as const;

const STEPS = [
  {
    title: "Creá tu cuenta",
    description: "Con tu correo y una contraseña. Sin tarjeta, sin trámites.",
  },
  {
    title: "Cargá tus animales",
    description: "Cerdas, cerdos de engorde, vacas — a tu ritmo, uno por uno.",
  },
  {
    title: "Controlá todo desde el panel",
    description: "Alimento, pesajes, producción y celos, siempre actualizados.",
  },
] as const;

const TRUST_POINTS = ["Sin tarjeta", "Sin trámites", "Sin límite de animales"] as const;

const FAQS = [
  {
    question: "¿Necesito internet todo el tiempo?",
    answer:
      "Sí, es una app web: necesitás conexión para cargar y guardar datos. Podés instalarla en la pantalla de inicio de tu celular para acceder más rápido, pero no funciona sin internet.",
  },
  {
    question: "¿Sirve si tengo pocos animales?",
    answer: "Sí. No hay mínimo ni máximo — funciona igual con 3 cerdas que con 300.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Cada cuenta ve únicamente sus propios animales y registros. Nadie más, ni siquiera otra cuenta registrada en Granja, puede verlos.",
  },
  {
    question: "¿Tiene algún costo?",
    answer: "No. Hoy Granja es 100% gratis, sin límite de tiempo ni de animales.",
  },
] as const;

function TrustPoints() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      {TRUST_POINTS.map((point) => (
        <span key={point} className="inline-flex items-center gap-1">
          <span className="text-accent" aria-hidden="true">
            ✓
          </span>
          {point}
        </span>
      ))}
    </div>
  );
}

// Public landing page: renders for everyone, authenticated or not. Reads
// the session only to branch the CTA set via the pure getLandingCtas — it
// never calls redirect(), unlike the (app) layout's auth guard.
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctas = getLandingCtas(user);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-display text-xl text-accent">Granja</span>
        <nav className="flex items-center gap-4">
          {ctas.length > 1 && (
            <Link
              href={ctas[1].href}
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              {ctas[1].label}
            </Link>
          )}
          <Link href={ctas[0].href} className="btn-primary">
            {ctas[0].label}
          </Link>
        </nav>
      </header>

      <section className="grid gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="chip chip-good w-fit">100% gratis, sin tarjeta</span>
          <h1 className="max-w-2xl font-display text-4xl sm:text-5xl">
            Dejá el cuaderno. Controlá tu granja desde el celular.
          </h1>
          <p className="max-w-xl text-base text-ink-muted">
            Granja reúne cría, engorde, producción de leche y control
            reproductivo en un solo panel — sin planillas sueltas ni cálculos
            a mano.
          </p>
          <div className="flex flex-wrap gap-2">
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={cta.variant === "primary" ? "btn-primary" : "btn-secondary"}
              >
                {cta.label}
              </Link>
            ))}
          </div>
          <TrustPoints />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- local
            trusted SVG; next/image's optimizer refuses SVGs without
            `dangerouslyAllowSVG`, not worth the config surface here. */}
        <img
          src="/illustrations/farm-hero.svg"
          alt=""
          className="w-full max-w-lg justify-self-center"
        />
      </section>

      <section className="px-6 pb-16 sm:pb-24">
        <div className="relative mx-auto w-full max-w-xs">
          <div className="absolute -inset-10 -z-10 rounded-full bg-accent-wash blur-3xl" />
          <div className="absolute -inset-10 -z-10 translate-x-10 rounded-full bg-ochre-wash blur-3xl" />
          <div className="rounded-[2.5rem] border-[6px] border-ink bg-ink p-2 shadow-2xl">
            <div className="flex flex-col gap-3 rounded-[2rem] bg-surface-1 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Así se ve tu panel
              </p>
              <ul className="flex flex-col gap-2">
                <li className="tag-card flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-base">Cerda 214</span>
                    <span className="chip chip-good">Lactando</span>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-ink-muted">
                    8 lechones
                  </span>
                </li>
                <li className="tag-card flex items-center justify-between gap-3">
                  <span className="font-display text-base">Corral 3</span>
                  <span className="font-mono text-sm tabular-nums text-ink-muted">
                    FCR 2.4
                  </span>
                </li>
                <li className="tag-card flex items-center justify-between gap-3">
                  <span className="font-display text-base">Vaca Manchas</span>
                  <span className="font-mono text-sm tabular-nums text-ink-muted">
                    18.5 L hoy
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl">
          Todo lo que hoy hacés en cuadernos, en un solo lugar
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BENEFITS.map(({ title, description, Icon }) => (
            <li key={title} className="tag-card">
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-wash text-accent">
                <Icon className="h-7 w-7" />
              </span>
              <span className="font-display text-lg">{title}</span>
              <p className="text-sm text-ink-muted">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6 px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl">Empezar toma menos de 2 minutos</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-wash font-mono text-sm font-bold text-accent">
                {index + 1}
              </span>
              <span className="font-display text-lg">{step.title}</span>
              <p className="text-sm text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6 px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq) => (
            <details key={faq.question} className="tag-card">
              <summary className="cursor-pointer font-display text-lg marker:text-accent">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm text-ink-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 border-t border-border px-6 py-16 sm:py-20">
        <h2 className="text-2xl">Registrate gratis y empezá hoy</h2>
        <p className="max-w-md text-sm text-ink-muted">
          Sin costo, sin tarjeta de crédito, sin límite de animales.
        </p>
        <div className="flex flex-wrap gap-2">
          {ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={cta.variant === "primary" ? "btn-primary" : "btn-secondary"}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Granja
      </footer>
    </main>
  );
}
