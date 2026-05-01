-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Pedidos
create type public.pedido_status as enum ('novo', 'em_producao', 'aprovado', 'pago', 'cancelado');

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  estado text not null,
  personalidade text not null,
  quantidade text not null,
  cenario text,
  observacoes text,
  valor text not null,
  selfie_path text not null,
  status public.pedido_status not null default 'novo'
);

alter table public.pedidos enable row level security;

-- Anonymous public can insert orders
create policy "Anyone can create an order"
on public.pedidos for insert
to anon, authenticated
with check (true);

-- Only admins can read/update/delete
create policy "Admins can view orders"
on public.pedidos for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update orders"
on public.pedidos for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete orders"
on public.pedidos for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for selfies (private)
insert into storage.buckets (id, name, public)
values ('selfies', 'selfies', false);

-- Anyone can upload to selfies bucket
create policy "Anyone can upload a selfie"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'selfies');

-- Only admins can read selfies
create policy "Admins can read selfies"
on storage.objects for select
to authenticated
using (bucket_id = 'selfies' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete selfies"
on storage.objects for delete
to authenticated
using (bucket_id = 'selfies' and public.has_role(auth.uid(), 'admin'));
