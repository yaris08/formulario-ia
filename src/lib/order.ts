import { z } from "zod";

export const ESTADOS_BR = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
] as const;

export const PERSONALIDADES = {
  Política: ["Jair Bolsonaro", "Lula", "Nikolas Ferreira", "Tarcísio de Freitas"],
  "Artistas / Cantores": [
    "Zé Neto & Cristiano",
    "Jorge & Mateus",
    "Gusttavo Lima",
    "Henrique & Juliano",
    "Simone Mendes",
  ],
} as const;

export const CENARIOS = [
  "Abraçados / Próximos",
  "Pose formal",
  "Ao ar livre",
  "Evento / Palco",
  "Sem preferência",
] as const;

export const QUANTIDADE_OPTIONS = [
  { value: "1", label: "1 foto — R$ 8,90", price: "8,90" },
  { value: "2", label: "2 fotos — R$ 15,00", price: "15,00" },
  { value: "3", label: "3 fotos — R$ 20,00", price: "20,00" },
  { value: "4+", label: "4+ fotos — combinar", price: "combinar" },
] as const;

export const PRICE_MAP: Record<string, string> = {
  "1": "8,90",
  "2": "15,00",
  "3": "20,00",
  "4+": "combinar",
};

export const orderSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  whatsapp: z
    .string()
    .trim()
    .min(14, "Informe um WhatsApp válido")
    .max(16, "Número muito longo"),
  estado: z.enum(ESTADOS_BR, { message: "Selecione um estado" }),
  personalidade: z.string().min(1, "Escolha uma opção"),
  personalidade_outro: z.string().trim().max(120).optional().or(z.literal("")),
  quantidade: z.enum(["1", "2", "3", "4+"], { message: "Selecione a quantidade" }),
  cenario: z.string().optional().or(z.literal("")),
  observacoes: z.string().max(400).optional().or(z.literal("")),
}).refine(
  (data) => data.personalidade !== "outro" || (data.personalidade_outro && data.personalidade_outro.length >= 2),
  { message: "Descreva quem é a personalidade", path: ["personalidade_outro"] },
);

export type OrderFormValues = z.infer<typeof orderSchema>;

export function maskWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export const MAX_SELFIE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_SELFIE_TYPES = ["image/jpeg", "image/png", "image/webp"];
