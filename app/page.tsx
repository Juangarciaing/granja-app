import Link from "next/link";

import { getLandingCtas } from "@/lib/landing/cta";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    title: "Cerdas reproductoras",
    description:
      "Registrá partos y lactancias; el alimento diario por camada se calcula solo.",
  },
  {
    title: "Cerdos de engorde",
    description:
      "Seguí la conversión alimenticia y el avance hacia el peso objetivo de cada lote.",
  },
  {
    title: "Vacas lecheras",
    description:
      "Anotá la producción diaria de leche y seguí el rendimiento de cada vaca.",
  },
  {
    title: "Control reproductivo",
    description:
      "Registrá celos y seguí el ciclo reproductivo de tus animales.",
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
    <main className="flex flex-1 flex-col gap-10 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl">
          Llevá el control de tu granja en un solo lugar
        </h1>
        <p className="max-w-xl text-sm text-ink-muted">
          Granja reúne cría, engorde, producción de leche y control
          reproductivo — sin planillas sueltas.
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
      </div>

      <ul className="flex flex-col gap-2">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="tag-card">
            <span className="font-display text-lg">{feature.title}</span>
            <p className="text-sm text-ink-muted">{feature.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
