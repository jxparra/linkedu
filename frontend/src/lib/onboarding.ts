import type { User } from "./api";

/** Decide a qué pantalla tiene que ir el usuario según lo que ya ha rellenado. */
export function nextStep(user: User): string {
  if (!user.email_verified) return "/registro/verificar";
  if (!user.role) return "/registro/tipo";
  if (user.onboarding_done) return "/inicio";
  if (user.role === "company") return user.company ? "/registro/empresa/logo" : "/registro/empresa/datos";
  if (!user.student_profile) return "/registro/estudiante/datos";
  if (!user.student_profile.school_id) return "/registro/estudiante/estudios";
  return "/registro/estudiante/foto";
}
