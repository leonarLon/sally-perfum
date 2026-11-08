import type { AuditEntry } from "@/lib/admin/queries";
import { AUDIT_ACTION, AUDIT_ENTITY, formatDateTime, visibleChangedFields } from "./labels";

/** Histórico da auditoria. O autor aparece como "você" ou pelo id curto (sem expor e-mails). */
export function AuditList({ entries, currentUserId }: { entries: AuditEntry[]; currentUserId: string }) {
  if (!entries.length) return <p className="text-sm text-muted">Nenhuma alteração registrada ainda.</p>;
  return (
    <ol className="divide-y divide-border rounded-card border border-border">
      {entries.map((e) => {
        const fields = e.action === "update" ? visibleChangedFields(e.changes) : [];
        const who = e.actor_id === null ? "Sistema (carga)" : e.actor_id === currentUserId ? "Você" : `Admin ${e.actor_id.slice(0, 8)}`;
        return (
          <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
            <span>
              <strong className="font-medium">{who}</strong> {AUDIT_ACTION[e.action]} {AUDIT_ENTITY[e.entity] ?? e.entity}
              {fields.length > 0 && <span className="text-muted"> · {fields.join(", ")}</span>}
            </span>
            <time dateTime={e.created_at} className="text-xs text-muted">
              {formatDateTime(e.created_at)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
