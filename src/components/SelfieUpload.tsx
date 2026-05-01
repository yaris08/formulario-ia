import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { ACCEPTED_SELFIE_TYPES, MAX_SELFIE_BYTES } from "@/lib/order";
import { toast } from "sonner";

interface SelfieUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function SelfieUpload({ file, onChange }: SelfieUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function validate(f: File): boolean {
    if (!ACCEPTED_SELFIE_TYPES.includes(f.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return false;
    }
    if (f.size > MAX_SELFIE_BYTES) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return false;
    }
    return true;
  }

  function handleFile(f: File) {
    if (!validate(f)) return;
    onChange(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative cursor-pointer rounded border border-dashed bg-surface-1 px-6 py-10 text-center transition-colors ${
        dragOver ? "border-gold bg-surface-2" : "border-border hover:border-gold hover:bg-surface-2"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onInputChange}
        className="sr-only"
      />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border">
        <Upload className="h-5 w-5 text-gold" strokeWidth={1.5} />
      </div>
      <p className="text-[0.95rem] text-foreground">
        {file ? file.name : "Clique ou arraste sua foto aqui"}
      </p>
      <p className="text-[0.85rem] text-muted-foreground mt-1">
        JPG, PNG ou WEBP — máx. 10MB
      </p>
      {preview && (
        <img
          src={preview}
          alt="Pré-visualização da selfie"
          className="mt-4 max-h-56 w-full rounded object-cover"
        />
      )}
    </div>
  );
}
