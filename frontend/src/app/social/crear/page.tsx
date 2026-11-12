"use client";

import { AppShell } from "@/components/app/AppShell";
import { GroupEditor } from "@/components/social/GroupEditor";

export default function CrearGrupo() {
  return <AppShell bare>{(user) => <GroupEditor user={user} />}</AppShell>;
}
