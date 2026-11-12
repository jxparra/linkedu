const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "studyhub_token";

export type User = {
  id: number;
  email: string;
  username: string | null;
  role: "student" | "company" | "admin" | null;
  email_verified: boolean;
  onboarding_done: boolean;
  student_profile: {
    name: string;
    surname: string;
    location: string | null;
    school_id: number | null;
    degree_id: number | null;
    course: number | null;
  } | null;
  company: { name: string; sector: string | null; location: string | null } | null;
};

export type Option = { id: number; name: string };
export type CommunityOption = Option & { description: string | null; members: number };

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function errorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    return String(detail[0].msg).replace(/^Value error, /, "");
  }
  return "Algo ha fallado. Inténtalo de nuevo.";
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor. Comprueba que el backend está arrancado.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(errorMessage(data.detail), res.status);
  return data as T;
}

export type Author = {
  id: number;
  name: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  headline: string | null;
  badge: string | null;
};

export type MediaItem = { url: string; type: "image" | "video" | "gif" };

export type Comment = {
  id: number;
  post_id: number;
  parent_id: number | null;
  author: Author;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: number;
  liked_by_me: boolean;
  replies: number;
  is_mine: boolean;
  can_delete: boolean;
  by_post_author: boolean;
};

export type Post = {
  id: number;
  type: "general" | "pregunta" | "recurso" | "debate";
  content: string;
  image_url: string | null;
  media_type: "image" | "video" | "gif" | null;
  media: MediaItem[];
  feeling: string | null;
  location: string | null;
  tagged: { id: number; name: string }[];
  created_at: string;
  edited: boolean;
  author: Author;
  community: { id: number; name: string; is_group: boolean } | null;
  likes: number;
  comments: number;
  shares: number;
  liked_by_me: boolean;
  shared_by_me: boolean;
  saved_by_me: boolean;
  following_author: boolean;
  is_mine: boolean;
};

export type Trend = { id: number; name: string; posts: number; members: number; last_activity: string | null };

export type NotificationItem = {
  id: number;
  type: string;
  text: string;
  actor: Author | null;
  post_excerpt: string | null;
  job_id: number | null;
  job_title: string | null;
  group_id: number | null;
  group_name: string | null;
  read: boolean;
  created_at: string;
};

export type Conversation = { user: Author; last_message: string; last_from_me: boolean; last_at: string; unread: number };
export type ChatMessage = { id: number; content: string; from_me: boolean; created_at: string };
export type SearchResult = { users: Author[]; communities: { id: number; name: string; members: number }[] };
export type Profile = {
  user: Author;
  posts: number;
  followers: number;
  following: number;
  is_me: boolean;
  followed_by_me: boolean;
  communities: { id: number; name: string }[];
};

/** Las subidas se guardan como "/uploads/…" en el backend: aquí se convierten en URL completa. */
export function mediaUrl(url: string): string {
  return /^(https?:|blob:|data:)/.test(url) ? url : `${API_URL}${url}`;
}

export async function uploadFile(file: Blob, filename = "archivo"): Promise<{ url: string; media_type: "image" | "video" | "gif" }> {
  const token = getToken();
  const body = new FormData();
  body.append("file", file, (file as File).name ?? filename);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor. Comprueba que el backend está arrancado.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(errorMessage(data.detail), res.status);
  return data;
}

/** Avisa a la barra superior de que vuelva a contar mensajes y notificaciones sin leer. */
export function refreshUnread() {
  window.dispatchEvent(new Event("studyhub:unread"));
}

export type Metric = { value: number; previous: number; change_pct: number | null };
export type Performance = {
  days: number;
  start: string;
  end: string;
  previous_start: string;
  followers: { total: number; new: number; change_pct: number | null };
  profile_views: Metric;
  search_appearances: Metric;
  post_impressions: Metric;
};
export type PostStats = {
  id: number;
  excerpt: string;
  created_at: string;
  impressions: number;
  impressions_period: number;
  likes: number;
  comments: number;
  shares: number;
};

/** Cierra la sesión en este navegador. */
export function logout() {
  setToken(null);
  window.location.href = "/login";
}

// ---------------------------------------------------------------------------
// Grupos (sección Social)
// ---------------------------------------------------------------------------

export type GroupPrivacy = "public" | "private";

export type GroupCard = {
  id: number;
  name: string;
  description: string | null;
  topic: string | null;
  topic_label: string | null;
  privacy: GroupPrivacy;
  cover_url: string | null;
  province: string | null;
  members: number;
  posts_week: number;
  /** Por qué se sugiere: "Porque estudias DAW", "12 personas de Granada", "Algo nuevo: Música" */
  reason: string | null;
  is_member: boolean;
};

export type GroupSuggestions = { province: string | null; for_you: GroupCard[]; nearby: GroupCard[]; more: GroupCard[] };

export type MyGroup = {
  id: number;
  name: string;
  topic: string | null;
  privacy: GroupPrivacy;
  cover_url: string | null;
  members: number;
  role: "admin" | "member";
  joined_at: string | null;
  last_activity: string | null;
};

export type Group = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  topic: string | null;
  topic_label: string | null;
  privacy: GroupPrivacy;
  cover_url: string | null;
  province: string | null;
  created_at: string | null;
  members: number;
  posts_week: number;
  is_member: boolean;
  role: "admin" | "member" | null;
  admins: Author[];
  member_preview: Author[];
  following_in_group: Author[];
  can_see_content: boolean;
};

export type GroupMember = { user: Author; role: "admin" | "member"; joined_at: string | null };
export type Topic = { key: string; label: string; universal: boolean };

/** Avisa al menú de Grupos de que vuelva a cargar "Grupos a los que te has unido". */
export function refreshGroups() {
  window.dispatchEvent(new Event("studyhub:groups"));
}
