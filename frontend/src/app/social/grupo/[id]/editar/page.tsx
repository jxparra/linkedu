"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ButtonLink } from "@/components/Button";
import { GroupEditor } from "@/components/social/GroupEditor";
import { api, type Group, type User } from "@/lib/api";

function Edit({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null | false>(null);

  useEffect(() => {
    api<Group>(`/groups/${id}`)
      .then((g) => setGroup(g.role === "admin" ? g : false))
      .catch(() => setGroup(false));
  }, [id]);

  if (group === null) return <div className="h-96 animate-pulse rounded-card bg-white" />;
  if (group === false)
    return (
      <div className="rounded-card border border-line bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">Solo los administradores pueden editar el grupo</h1>
        <ButtonLink href={`/social/grupo/${id}`} variant="secondary" className="mt-4">
          Volver al grupo
        </ButtonLink>
      </div>
    );
  return <GroupEditor user={user} group={group} />;
}

export default function EditarGrupo() {
  return <AppShell bare>{(user) => <Edit user={user} />}</AppShell>;
}
