import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_EMAIL } from "@/lib/admin";

type Mode = "loading" | "create" | "login";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Detect first access by querying the public edge function.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-status");
        if (cancelled) return;
        if (error) {
          // Fail open to login mode; user will get an error if account doesn't exist.
          setMode("login");
          return;
        }
        setMode(data?.exists ? "login" : "create");
      } catch {
        if (!cancelled) setMode("login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If already logged in as the authorized admin, go to dashboard.
  // If logged in as someone else, sign them out.
  useEffect(() => {
    if (loading || !session) return;
    const userEmail = session.user.email?.toLowerCase();
    if (userEmail !== ADMIN_EMAIL) {
      supabase.auth.signOut().then(() => {
        toast.error("Acesso não autorizado.");
      });
      return;
    }
    if (isAdmin) navigate("/admin", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setInlineError(null);
    const normalized = email.trim().toLowerCase();
    if (normalized !== ADMIN_EMAIL) {
      setInlineError("Acesso não autorizado.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw error;
      toast.success("Login realizado!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      setInlineError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setInlineError(null);
    if (password.length < 6) {
      setInlineError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setInlineError("As senhas não coincidem");
      return;
    }
    setBusy(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (signUpError && !/already/i.test(signUpError.message)) throw signUpError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (signInError) throw signInError;
      toast.success("Senha criada! Entrando...");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar senha";
      setInlineError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </main>
    );
  }

  const isCreate = mode === "create";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold">
            <Camera className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl">Painel Admin</h1>
          <p className="text-[0.85rem] text-muted-foreground mt-1 uppercase tracking-[0.05em]">
            {isCreate ? "Crie sua senha" : "Acesse sua conta"}
          </p>
        </div>

        {isCreate ? (
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded border border-border bg-surface-1 p-6"
          >
            <div>
              <label className="field-label">Senha</label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Confirmar senha</label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {inlineError && (
              <p className="text-[0.78rem] text-destructive">{inlineError}</p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-auto py-3 bg-gold text-background hover:bg-gold/90 uppercase tracking-[0.08em] text-[0.8rem]"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar senha e entrar"
              )}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded border border-border bg-surface-1 p-6"
          >
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
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {inlineError && (
              <p className="text-[0.78rem] text-destructive">{inlineError}</p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-auto py-3 bg-gold text-background hover:bg-gold/90 uppercase tracking-[0.08em] text-[0.8rem]"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
