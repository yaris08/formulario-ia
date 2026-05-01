import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2, ExternalLink, Camera, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Pedido = Tables<"pedidos">;
type Status = Enums<"pedido_status">;

const STATUS_LABELS: Record<Status, string> = {
  novo: "Novo",
  em_producao: "Em produção",
  aprovado: "Aprovado",
  pago: "Pago",
  cancelado: "Cancelado",
};

const STATUS_OPTIONS: Status[] = ["novo", "em_producao", "aprovado", "pago", "cancelado"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading, signOut } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selfieUrls, setSelfieUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!session) navigate("/admin/login", { replace: true });
    else if (!isAdmin) navigate("/admin/login", { replace: true });
    else loadPedidos();
  }, [authLoading, session, isAdmin, navigate]);

  async function loadPedidos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar pedidos.");
      setLoading(false);
      return;
    }
    setPedidos(data ?? []);

    // signed URLs for selfies
    const paths = (data ?? []).map((p) => p.selfie_path);
    if (paths.length) {
      const { data: signed } = await supabase.storage
        .from("selfies")
        .createSignedUrls(paths, 60 * 60);
      const map: Record<string, string> = {};
      signed?.forEach((s, i) => {
        if (s.signedUrl) map[paths[i]] = s.signedUrl;
      });
      setSelfieUrls(map);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status.");
      return;
    }
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success("Status atualizado.");
  }

  async function deletePedido(id: string, selfiePath: string) {
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir pedido.");
      return;
    }
    // Best-effort: remove selfie do storage
    if (selfiePath) {
      await supabase.storage.from("selfies").remove([selfiePath]);
    }
    setPedidos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Pedido excluído.");
  }

  const filtered = useMemo(
    () => (filter === "all" ? pedidos : pedidos.filter((p) => p.status === filter)),
    [pedidos, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: pedidos.length };
    STATUS_OPTIONS.forEach((s) => (c[s] = pedidos.filter((p) => p.status === s).length));
    return c;
  }, [pedidos]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-5">
        <div className="container max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold">
              <Camera className="h-4 w-4 text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-xl leading-tight">Pedidos</h1>
              <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                {counts.all} {counts.all === 1 ? "pedido" : "pedidos"} no total
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/admin/login"))}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={counts.all}>
            Todos
          </FilterChip>
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
              count={counts[s]}
            >
              {STATUS_LABELS[s]}
            </FilterChip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded border border-border bg-surface-1 p-12 text-center text-muted-foreground">
            Nenhum pedido por aqui ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                selfieUrl={selfieUrls[p.selfie_path]}
                onStatusChange={(s) => updateStatus(p.id, s)}
                onDelete={() => deletePedido(p.id, p.selfie_path)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterChip({
  children,
  active,
  count,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-[0.75rem] uppercase tracking-[0.08em] border transition-colors ${
        active
          ? "border-gold bg-gold text-background"
          : "border-border bg-surface-1 text-muted-foreground hover:text-foreground hover:border-gold/60"
      }`}
    >
      {children} <span className="opacity-70 ml-1">{count}</span>
    </button>
  );
}

function PedidoCard({
  pedido,
  selfieUrl,
  onStatusChange,
  onDelete,
}: {
  pedido: Pedido;
  selfieUrl?: string;
  onStatusChange: (s: Status) => void;
  onDelete: () => void;
}) {
  const waNumber = pedido.whatsapp.replace(/\D/g, "");
  return (
    <article className="rounded border border-border bg-surface-1 p-5">
      <div className="flex gap-4">
        {selfieUrl ? (
          <a
            href={selfieUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-24 w-24 shrink-0 overflow-hidden rounded border border-border"
          >
            <img src={selfieUrl} alt={`Selfie de ${pedido.nome}`} className="h-full w-full object-cover" />
          </a>
        ) : (
          <div className="h-24 w-24 shrink-0 rounded border border-border bg-surface-2" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-xl truncate">{pedido.nome}</h3>
              <a
                href={`https://wa.me/55${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.8rem] text-gold hover:underline inline-flex items-center gap-1"
              >
                {pedido.whatsapp} <ExternalLink className="h-3 w-3" />
              </a>
              {pedido.estado && (
                <span className="ml-2 text-[0.7rem] uppercase tracking-[0.08em] text-muted-foreground">
                  {pedido.estado}
                </span>
              )}
            </div>
            <span className="text-[0.7rem] text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(pedido.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="mt-2 text-[0.85rem]">
            <span className="text-muted-foreground">Personalidade:</span>{" "}
            <span className="text-gold">{pedido.personalidade}</span>
          </p>
          {pedido.outra_pessoa && (
            <p className="text-[0.85rem]">
              <span className="text-muted-foreground">Outra pessoa:</span>{" "}
              <span className="text-gold">{pedido.outra_pessoa}</span>
            </p>
          )}
          <p className="text-[0.85rem]">
            <span className="text-muted-foreground">Quantidade:</span> {pedido.quantidade} foto(s) ·{" "}
            <span className="text-muted-foreground">Valor:</span> R$ {pedido.valor}
          </p>
          {pedido.cenario && (
            <p className="text-[0.85rem]">
              <span className="text-muted-foreground">Cenário:</span> {pedido.cenario}
            </p>
          )}
        </div>
      </div>

      {pedido.observacoes && (
        <p className="mt-4 rounded bg-surface-2 p-3 text-[0.8rem] text-muted-foreground whitespace-pre-wrap">
          {pedido.observacoes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[0.7rem] uppercase tracking-[0.08em] text-muted-foreground">Status</span>
          <Select value={pedido.status} onValueChange={(v) => onStatusChange(v as Status)}>
            <SelectTrigger className="h-9 max-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O pedido de{" "}
                <strong className="text-foreground">{pedido.nome}</strong> e a selfie enviada
                serão removidos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
