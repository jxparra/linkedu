"use client";

import { Check, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { OnboardingShell } from "@/components/OnboardingShell";
import { api, ApiError, type CommunityOption } from "@/lib/api";
import { useUser } from "@/lib/useUser";

export default function EstudianteComunidades() {
  const router = useRouter();
  const { user } = useUser();
  const [communities, setCommunities] = useState<CommunityOption[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = user?.student_profile;
    if (!p) return;
    api<CommunityOption[]>(`/catalog/communities/suggested?degree_id=${p.degree_id ?? ""}&school_id=${p.school_id ?? ""}`)
      .then((c) => {
        setCommunities(c);
        setSelected(new Set(c.filter((x) => x.description?.startsWith("Comunidad de") || x.description?.startsWith("Estudiantes de")).map((x) => x.id)));
      })
      .catch(() => setCommunities([]));
  }, [user]);

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selected.size) await api("/onboarding/communities", { method: "POST", body: { community_ids: [...selected] } });
      await api("/onboarding/finish", { method: "POST" });
      router.push("/inicio");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Algo ha fallado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      progress={95}
      title="Únete a comunidades de tus estudios"
      subtitle="Verás sus publicaciones en tu inicio. Puedes salir cuando quieras."
      onSubmit={submit}
      loading={loading}
      submitLabel="Entrar en StudyHub"
    >
      <ErrorBanner message={error} />
      {communities === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-card bg-page" />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <p className="rounded-card bg-page p-5 text-ink-muted">
          Aún no hay comunidades para tus estudios. Podrás crear la primera desde tu inicio.
        </p>
      ) : (
        <ul className="space-y-3">
          {communities.map((c) => {
            const on = selected.has(c.id);
            return (
              <li key={c.id} className="flex items-center gap-4 rounded-card border border-line p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-sm text-ink-muted">{c.description}</span>
                </span>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
                    on ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-line hover:border-ink-subtle"
                  }`}
                >
                  {on ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                  {on ? "Siguiendo" : "Seguir"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </OnboardingShell>
  );
}
