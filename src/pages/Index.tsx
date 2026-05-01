import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, Clock, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelfieUpload } from "@/components/SelfieUpload";
import {
  CENARIOS,
  PERSONALIDADES,
  PRICE_MAP,
  QUANTIDADE_OPTIONS,
  maskWhatsapp,
  orderSchema,
  type OrderFormValues,
} from "@/lib/order";

const Index = () => {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      nome: "",
      whatsapp: "",
      personalidade: "",
      personalidade_outro: "",
      cenario: "",
      observacoes: "",
    } as Partial<OrderFormValues> as OrderFormValues,
  });

  const personalidade = form.watch("personalidade");
  const quantidade = form.watch("quantidade");
  const observacoes = form.watch("observacoes") ?? "";
  const price = useMemo(() => PRICE_MAP[quantidade ?? ""] ?? "—", [quantidade]);

  async function onSubmit(values: OrderFormValues) {
    if (!selfie) {
      toast.error("Por favor, envie sua selfie antes de continuar.");
      return;
    }
    setSubmitting(true);
    try {
      const ext = selfie.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("selfies")
        .upload(path, selfie, { contentType: selfie.type, upsert: false });
      if (upErr) throw upErr;

      const finalPersonalidade =
        values.personalidade === "outro"
          ? (values.personalidade_outro ?? "").trim()
          : values.personalidade;

      const { error: insErr } = await supabase.from("pedidos").insert({
        nome: values.nome.trim(),
        whatsapp: values.whatsapp.trim(),
        personalidade: finalPersonalidade,
        quantidade: values.quantidade,
        cenario: values.cenario || null,
        observacoes: values.observacoes?.trim() || null,
        valor: PRICE_MAP[values.quantidade] ?? "—",
        selfie_path: path,
      });
      if (insErr) throw insErr;

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen">
        <div className="container max-w-xl px-6 py-24 text-center">
          <div className="mx-auto mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-success">
            <Check className="h-8 w-8 text-success" strokeWidth={2} />
          </div>
          <h1 className="font-display text-4xl mb-4">Pedido recebido!</h1>
          <p className="text-muted-foreground">
            Em breve entraremos em contato pelo seu WhatsApp.
            <br />
            Fique atento às mensagens!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="px-6 pt-14 pb-10 text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold">
            <Camera className="h-[18px] w-[18px] text-gold" strokeWidth={1.5} />
          </div>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-tight mb-3">
          Foto <span className="text-gold">Ultra-Realista</span>
          <br />
          com o Mito ou o Ídolo
        </h1>
        <p className="text-[0.95rem] text-muted-foreground tracking-[0.05em] uppercase">
          Tecnologia de IA — Resultado em até 24h
        </p>
      </header>

      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-border px-6 py-5 mb-12">
        <TrustItem icon={<Check className="h-3.5 w-3.5" />} text="+ de 749 fotos entregues" />
        <TrustItem icon={<Shield className="h-3.5 w-3.5" />} text="Privacidade garantida" />
        <TrustItem icon={<Clock className="h-3.5 w-3.5" />} text="Pague só após aprovar" />
      </div>

      {/* Form */}
      <div className="container max-w-2xl px-6 pb-16">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {/* DADOS */}
          <section className="mb-10">
            <div className="section-label">Seus dados</div>

            <div className="mb-5">
              <label className="field-label">
                Nome completo <span className="required-mark">*</span>
              </label>
              <Input
                placeholder="Como prefere ser chamado?"
                {...form.register("nome")}
                aria-invalid={!!form.formState.errors.nome}
              />
              <FieldError msg={form.formState.errors.nome?.message} />
            </div>

            <div>
              <label className="field-label">
                WhatsApp <span className="required-mark">*</span>
              </label>
              <Input
                inputMode="tel"
                placeholder="(00) 00000-0000"
                value={form.watch("whatsapp") ?? ""}
                onChange={(e) =>
                  form.setValue("whatsapp", maskWhatsapp(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
              <FieldError msg={form.formState.errors.whatsapp?.message} />
            </div>
          </section>

          {/* PEDIDO */}
          <section className="mb-10">
            <div className="section-label">Seu pedido</div>

            <div className="mb-5">
              <label className="field-label">
                Com quem você quer a foto? <span className="required-mark">*</span>
              </label>
              <Select
                value={form.watch("personalidade") ?? ""}
                onValueChange={(v) => form.setValue("personalidade", v, { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Escolha uma opção" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERSONALIDADES).map(([group, names]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {names.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectGroup>
                  ))}
                  <SelectItem value="outro">Outro (descreva abaixo)</SelectItem>
                </SelectContent>
              </Select>
              <FieldError msg={form.formState.errors.personalidade?.message} />
            </div>

            {personalidade === "outro" && (
              <div className="mb-5">
                <label className="field-label">
                  Quem é a personalidade? <span className="required-mark">*</span>
                </label>
                <Input
                  placeholder="Nome completo da pessoa"
                  {...form.register("personalidade_outro")}
                />
                <FieldError msg={form.formState.errors.personalidade_outro?.message} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">
                  Quantidade de fotos <span className="required-mark">*</span>
                </label>
                <Select
                  value={form.watch("quantidade") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("quantidade", v as OrderFormValues["quantidade"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {QUANTIDADE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError msg={form.formState.errors.quantidade?.message} />
              </div>
              <div>
                <label className="field-label">Tipo de cenário</label>
                <Select
                  value={form.watch("cenario") ?? ""}
                  onValueChange={(v) => form.setValue("cenario", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {CENARIOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5">
              <label className="field-label">Observações / Detalhes extras</label>
              <Textarea
                rows={4}
                maxLength={400}
                placeholder="Ex: quero que pareça um encontro casual, prefiro fundo neutro, roupas mais formais..."
                {...form.register("observacoes")}
              />
              <div className="mt-1 text-right text-[0.72rem] text-muted-foreground">
                {observacoes.length}/400
              </div>
            </div>
          </section>

          {/* SELFIE */}
          <section className="mb-10">
            <div className="section-label">Sua selfie</div>
            <SelfieUpload file={selfie} onChange={setSelfie} />
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "Rosto bem iluminado e visível",
                "Sem óculos de sol ou máscara",
                "Foto nítida, sem borrão",
                "Quanto mais alta a qualidade, melhor o resultado",
              ].map((q) => (
                <div key={q} className="flex gap-2 items-start rounded bg-surface-2 p-3 text-[0.75rem] text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PRICE */}
          <div className="mb-8 flex items-center justify-between gap-4 rounded border border-border bg-surface-1 p-6">
            <div>
              <div className="text-[0.75rem] uppercase tracking-[0.08em] text-muted-foreground mb-1">
                Valor do pedido
              </div>
              <div className="font-display text-3xl text-gold leading-none">
                {price === "—" ? (
                  <span className="text-xl text-muted-foreground">—</span>
                ) : (
                  <>
                    <small className="text-base text-muted-foreground mr-1">R$</small>
                    {price}
                  </>
                )}
              </div>
            </div>
            <p className="max-w-[12rem] text-right text-[0.75rem] leading-relaxed text-muted-foreground">
              O pagamento é feito via Pix{" "}
              <strong className="text-foreground">somente após você aprovar a foto</strong>. Sem risco.
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-auto py-4 text-[0.85rem] font-medium uppercase tracking-[0.1em] bg-gold text-background hover:bg-gold/90"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Pedido"}
          </Button>

          <p className="mt-6 text-center text-[0.75rem] leading-loose text-muted-foreground">
            Suas fotos são usadas exclusivamente para criação artística com IA.
            <br />
            Todas as imagens geradas são identificadas como criadas por inteligência artificial.
            <br />
            Não compartilhamos seus dados com terceiros.
          </p>
        </form>
      </div>
    </main>
  );
};

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.04em] text-muted-foreground">
      <span className="text-gold">{icon}</span>
      {text}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[0.75rem] text-destructive">{msg}</p>;
}

export default Index;
