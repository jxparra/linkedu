"use client";

import { Camera, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { useUser } from "@/lib/useUser";

export default function EstudianteFoto() {
  const router = useRouter();
  const { user } = useUser();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const next = () => router.push("/registro/estudiante/comunidades");
  const name = user?.student_profile ? `${user.student_profile.name} ${user.student_profile.surname}` : "";

  return (
    <OnboardingShell
      progress={80}
      title="Añade una foto para que te reconozcan"
      subtitle="Los perfiles con foto reciben más respuestas de las empresas."
      onSubmit={next}
      skip={next}
    >
      <div className="flex flex-col items-center rounded-card border border-line px-6 py-8">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-page"
          aria-label="Elegir foto de perfil"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-14 w-14 text-ink-subtle" aria-hidden />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6" aria-hidden />
          </span>
        </button>
        {name && <p className="mt-4 text-lg font-semibold">{name}</p>}
        {user?.username && <p className="text-sm text-ink-muted">@{user.username}</p>}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="mt-5 min-h-11 rounded-full border border-line px-5 text-[15px] font-semibold hover:border-ink-subtle"
        >
          {preview ? "Cambiar foto" : "Subir foto"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        <p className="mt-3 text-[13px] text-ink-muted">JPG, PNG o WebP. Máximo 5 MB.</p>
      </div>
    </OnboardingShell>
  );
}
