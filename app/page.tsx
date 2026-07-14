import Link from "next/link";

import { getLandingCtas } from "@/lib/landing/cta";
import { createClient } from "@/lib/supabase/server";

const BENEFITS = [
  {
    title: "Cerdas reproductoras",
    description:
      "Nunca más perdés la cuenta de un parto: el alimento diario de cada camada se calcula solo.",
  },
  {
    title: "Cerdos de engorde",
    description:
      "Sabés exactamente cuándo un lote está listo para vender, sin adivinar a ojo el peso.",
  },
  {
    title: "Vacas lecheras",
    description:
      "Producción diaria por vaca, para detectar una baja de leche antes de que te cueste plata.",
  },
  {
    title: "Control reproductivo",
    description:
      "Te avisa cuándo esperar el próximo celo, para no perder ciclos por no anotarlo a tiempo.",
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
      <section className="flex flex-col gap-6 px-6 py-16 sm:py-24">
        <span className="chip chip-good w-fit">100% gratis, sin tarjeta</span>
        <h1 className="max-w-2xl font-display text-4xl sm:text-5xl">
          Dejá el cuaderno. Controlá tu granja desde el celular.
        </h1>
        <p className="max-w-xl text-base text-ink-muted">
          Granja reúne cría, engorde, producción de leche y control
          reproductivo en un solo panel — sin planillas sueltas ni cálculos a
          mano.
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
        <p className="text-xs text-ink-faint">
          Sin costo, sin límite de animales, sin letra chica.
        </p>
      </section>

      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 rounded border border-border bg-surface-1 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Así se ve tu panel
          </p>
          <ul className="flex flex-col gap-2">
            <li className="tag-card flex items-center justify-between gap-3">
              <span className="font-display text-base">Cerda 214</span>
              <span className="chip chip-good">Lactando</span>
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
      </section>

      <section className="flex flex-col gap-6 px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl">
          Todo lo que hoy hacés en cuadernos, en un solo lugar
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="tag-card">
              <span className="font-display text-lg">{benefit.title}</span>
              <p className="text-sm text-ink-muted">{benefit.description}</p>
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
    </main>
  );
}
