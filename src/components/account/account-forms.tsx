"use client";
import { useActionState } from "react";
import { ActionButton, Field, FormMessage, SelectField, keepValuesOnSubmit, type FormAction } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import type { Address, Profile } from "@/lib/account/queries";
import { changePassword, deleteAccount, deleteAddress, saveProfile, setDefaultAddress } from "@/lib/account/actions";
import type { FormState } from "@/lib/admin/schemas";
import { UFS } from "@/lib/checkout/schemas";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label="Nome completo" autoComplete="name" state={state} defaultValue={profile.full_name ?? ""} required />
        <Field name="phone" label="Celular (opcional)" type="tel" autoComplete="tel" state={state} defaultValue={profile.phone ?? ""} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar dados"}
      </Button>
    </form>
  );
}

export function PasswordChangeForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="current_password" label="Senha atual" type="password" autoComplete="current-password" state={state} required />
        <Field name="password" label="Nova senha" type="password" autoComplete="new-password" state={state} required hint="8+ caracteres, letras e números." />
        <Field name="password_confirm" label="Confirme a nova senha" type="password" autoComplete="new-password" state={state} required />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Salvando…" : "Trocar senha"}
      </Button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="confirm" label="Digite EXCLUIR para confirmar" autoComplete="off" state={state} required />
        <Field name="password" label="Sua senha" type="password" autoComplete="current-password" state={state} required />
      </div>
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Excluindo…" : "Excluir minha conta"}
      </Button>
    </form>
  );
}

export function AddressForm({ action, address, submitLabel }: { action: FormAction; address?: Address; submitLabel: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-6">
        <Field name="label" label="Nome do endereço" state={state} defaultValue={address?.label ?? "Casa"} required className="sm:col-span-2" />
        <Field name="recipient" label="Quem recebe" autoComplete="name" state={state} defaultValue={address?.recipient} required className="sm:col-span-4" />
        <Field name="cep" label="CEP" autoComplete="postal-code" inputMode="numeric" maxLength={9} state={state} defaultValue={address?.cep} required className="sm:col-span-2" />
        <Field name="street" label="Endereço" autoComplete="address-line1" state={state} defaultValue={address?.street} required className="sm:col-span-4" />
        <Field name="number" label="Número" state={state} defaultValue={address?.number} required className="sm:col-span-2" />
        <Field name="complement" label="Complemento (opcional)" autoComplete="address-line2" state={state} defaultValue={address?.complement ?? ""} className="sm:col-span-4" />
        <Field name="district" label="Bairro" state={state} defaultValue={address?.district} required className="sm:col-span-2" />
        <Field name="city" label="Cidade" autoComplete="address-level2" state={state} defaultValue={address?.city} required className="sm:col-span-3" />
        <SelectField name="state" label="Estado" state={state} defaultValue={address?.state} required options={UFS.map((u) => ({ value: u, label: u }))} className="sm:col-span-1" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

export function AddressActions({ address }: { address: Address }) {
  return (
    <div className="flex flex-wrap gap-2">
      {!address.is_default && (
        <ActionButton action={setDefaultAddress.bind(null, address.id)} variant="outline" aria-label={`Tornar padrão: ${address.label}`}>
          Tornar padrão
        </ActionButton>
      )}
      <ActionButton
        action={deleteAddress.bind(null, address.id)}
        variant="ghost"
        className="text-error"
        confirmText={`Remover o endereço "${address.label}"?`}
        aria-label={`Remover endereço: ${address.label}`}
      >
        Remover
      </ActionButton>
    </div>
  );
}
