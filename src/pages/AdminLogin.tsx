import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Agora peça para receber acesso de admin.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold">
            <Camera className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl">Painel Admin</h1>
          <p className="text-[0.85rem] text-muted-foreground mt-1 uppercase tracking-[0.05em]">
            {mode === "signin" ? "Acesse sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded border border-border bg-surface-1 p-6">
          <div>
            <label className="field-label">E-mail</label>
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Senha</label>
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-auto py-3 bg-gold text-background hover:bg-gold/90 uppercase tracking-[0.08em] text-[0.8rem]"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="block w-full text-center text-[0.78rem] text-muted-foreground hover:text-gold transition-colors"
          >
            {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
        </form>

        {session && !isAdmin && (
          <p className="mt-6 rounded border border-border bg-surface-2 p-4 text-[0.8rem] text-muted-foreground">
            Você está logado, mas ainda não é admin. Solicite ao responsável que rode no banco:
            <br />
            <code className="mt-2 block text-[0.75rem] text-gold break-all">
              insert into user_roles (user_id, role) values ('{session.user.id}', 'admin');
            </code>
          </p>
        )}
      </div>
    </main>
  );
}
