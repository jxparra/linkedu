export const FEELINGS = [
  { label: "feliz", emoji: "😊" },
  { label: "motivado", emoji: "💪" },
  { label: "emocionado", emoji: "🤩" },
  { label: "orgulloso", emoji: "😌" },
  { label: "agradecido", emoji: "🙏" },
  { label: "con ganas", emoji: "🔥" },
  { label: "relajado", emoji: "😎" },
  { label: "nervioso", emoji: "😬" },
  { label: "cansado", emoji: "😴" },
  { label: "de exámenes", emoji: "📚" },
  { label: "estudiando", emoji: "📖" },
  { label: "programando", emoji: "💻" },
  { label: "celebrando", emoji: "🎉" },
  { label: "de prácticas", emoji: "💼" },
  { label: "en clase", emoji: "🏫" },
  { label: "de viaje", emoji: "✈️" },
];

function root(label: string) {
  return label.toLowerCase().replace(/[ao]$/, "");
}

export function feelingEmoji(label: string): string {
  return FEELINGS.find((f) => root(f.label) === root(label))?.emoji ?? "🙂";
}

/** "se siente 😊 feliz" o "está 📚 de exámenes" */
export function feelingPhrase(label: string): string {
  const verb = /^(de |en |con )|ando$|iendo$/.test(label) ? "está" : "se siente";
  return `${verb} ${feelingEmoji(label)} ${label}`;
}
