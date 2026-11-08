-- Sally Perfumaria — Fase 7: área do cliente (perfil, endereços, favoritos) e LGPD.
-- Dados do cliente: cada pessoa só lê e altera os próprios (RLS por auth.uid()).
-- Admin não lê endereços salvos nem favoritos (minimização); vê só o que está nos pedidos.

-- Exclusão de conta (LGPD): o histórico de estoque não pode impedir a remoção do usuário.
alter table public.inventory_movements drop constraint if exists inventory_movements_actor_id_fkey;
alter table public.inventory_movements
  add constraint inventory_movements_actor_id_fkey foreign key (actor_id) references auth.users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Perfil (criado sob demanda pelo próprio usuário; sem trigger em auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (length(full_name) between 2 and 120),
  phone text check (phone ~ '^[0-9]{10,11}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Endereços salvos (até 10 por pessoa, um padrão)
-- ---------------------------------------------------------------------------
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text not null default 'Casa' check (length(label) between 1 and 40),
  recipient text not null check (length(recipient) between 2 and 120),
  cep text not null check (cep ~ '^[0-9]{8}$'),
  street text not null check (length(street) between 2 and 160),
  number text not null check (length(number) between 1 and 20),
  complement text check (length(complement) <= 80),
  district text not null check (length(district) between 2 and 80),
  city text not null check (length(city) between 2 and 80),
  state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_addresses_user_idx on public.customer_addresses (user_id);
create unique index customer_addresses_one_default on public.customer_addresses (user_id) where is_default;

create trigger customer_addresses_updated_at before update on public.customer_addresses
  for each row execute function public.set_updated_at();

create or replace function public.customer_addresses_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.customer_addresses where user_id = new.user_id) >= 10 then
    raise exception 'limite de 10 endereços' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.customer_addresses_limit() from public, anon, authenticated;

create trigger customer_addresses_limit before insert on public.customer_addresses
  for each row execute function public.customer_addresses_limit();

-- Define o endereço padrão de forma atômica (o índice único parcial impede dois padrões).
create or replace function public.set_default_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.customer_addresses set is_default = false
   where user_id = (select auth.uid()) and is_default and id <> p_address_id;
  update public.customer_addresses set is_default = true
   where id = p_address_id and user_id = (select auth.uid());
  if not found then
    raise exception 'endereço não encontrado' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_default_address(uuid) from public, anon;
grant execute on function public.set_default_address(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Favoritos
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index favorites_product_idx on public.favorites (product_id);

-- ---------------------------------------------------------------------------
-- RLS: somente o dono
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.favorites enable row level security;

create policy "dono gerencia o próprio perfil" on public.profiles
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "dono gerencia os próprios endereços" on public.customer_addresses
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "dono lê os próprios favoritos" on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "dono remove os próprios favoritos" on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));
create policy "dono favorita produtos publicados" on public.favorites
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));

revoke all on public.profiles, public.customer_addresses, public.favorites from anon, authenticated;
grant select, insert, delete on public.profiles, public.customer_addresses, public.favorites to authenticated;
-- UPDATE só nas colunas editáveis: o dono nunca troca o user_id de uma linha.
grant update (full_name, phone) on public.profiles to authenticated;
grant update (label, recipient, cep, street, number, complement, district, city, state, is_default)
  on public.customer_addresses to authenticated;
