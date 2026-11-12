"use client";

import { useEffect, useState } from "react";
import { THEME_KEY as KEY } from "./theme-script";

/** Preferencia guardada en el navegador: claro, oscuro o lo que diga el sistema. */
export type ThemePref = "light" | "dark" | "system";


function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
}

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Tema elegido y función para cambiarlo. Con "system" sigue al sistema también si cambia mientras la web está abierta. */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(readPref());
    const sync = () => setPref(readPref());
    window.addEventListener("studyhub:theme", sync);
    return () => window.removeEventListener("studyhub:theme", sync);
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const change = (next: ThemePref) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* sin almacenamiento: solo dura esta visita */
    }
    apply(next);
    setPref(next);
    window.dispatchEvent(new Event("studyhub:theme"));
  };

  return { pref, change };
}
