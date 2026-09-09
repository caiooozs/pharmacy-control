"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signInWithPassword } from "@/services/Auth/auth.service";

import {
  loginSchema,
  type LoginField,
  type LoginFormErrors,
  type LoginFormValues,
} from "./Login.model";

const VALORES_INICIAIS: LoginFormValues = { email: "", senha: "" };

export function useLoginViewModel() {
  const router = useRouter();

  const [values, setValues] = useState<LoginFormValues>(VALORES_INICIAIS);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback((campo: LoginField, valor: string) => {
    setValues((atual) => ({ ...atual, [campo]: valor }));
    setErrors((atual) => {
      if (!atual[campo]) return atual;
      const proximo = { ...atual };
      delete proximo[campo];
      return proximo;
    });
    setFormError(null);
  }, []);

  const toggleMostrarSenha = useCallback(() => {
    setMostrarSenha((atual) => !atual);
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const resultado = loginSchema.safeParse(values);

      if (!resultado.success) {
        const proximosErros: LoginFormErrors = {};
        for (const issue of resultado.error.issues) {
          const campo = issue.path[0] as LoginField | undefined;
          if (campo && !proximosErros[campo]) {
            proximosErros[campo] = issue.message;
          }
        }
        setErrors(proximosErros);
        setFormError(null);
        return;
      }

      setErrors({});
      setFormError(null);

      startTransition(async () => {
        const { error } = await signInWithPassword(resultado.data);

        if (error) {
          setFormError(error);
          return;
        }

        router.replace("/");
        router.refresh();
      });
    },
    [router, values],
  );

  return {
    values,
    errors,
    formError,
    isPending,
    mostrarSenha,
    handleChange,
    handleSubmit,
    toggleMostrarSenha,
  };
}
