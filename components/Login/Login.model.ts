import { z } from "zod";

import type { useLoginViewModel } from "./Login.viewmodel";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .pipe(z.email("Informe um e-mail válido.")),
  senha: z.string().min(1, "Informe sua senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type LoginField = keyof LoginFormValues;

export type LoginFormErrors = Partial<Record<LoginField, string>>;

export type LoginViewProps = ReturnType<typeof useLoginViewModel>;
