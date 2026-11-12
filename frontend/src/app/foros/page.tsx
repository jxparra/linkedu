import { redirect } from "next/navigation";

/** Los foros viven dentro de Social. */
export default function Foros() {
  redirect("/social/foros");
}
