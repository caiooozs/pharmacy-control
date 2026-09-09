"use client";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import type { LoginViewProps } from "./Login.model";

export function LoginView({
  values,
  errors,
  formError,
  isPending,
  mostrarSenha,
  handleChange,
  handleSubmit,
  toggleMostrarSenha,
}: LoginViewProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Farmácia Beira Mar 1
          </CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o controle de estoque.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuário@gmail.com"
                  className="placeholder:text-xs placeholder:font-light placeholder:italic"
                  value={values.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <FieldError id="email-error">{errors.email}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-9 placeholder:text-xs placeholder:font-light placeholder:italic"
                    value={values.senha}
                    onChange={(event) =>
                      handleChange("senha", event.target.value)
                    }
                    disabled={isPending}
                    aria-invalid={!!errors.senha}
                    aria-describedby={errors.senha ? "senha-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2 text-muted-foreground"
                    onClick={toggleMostrarSenha}
                    disabled={isPending}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {mostrarSenha ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                {errors.senha && (
                  <FieldError id="senha-error">{errors.senha}</FieldError>
                )}
              </Field>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formError}
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Spinner />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
