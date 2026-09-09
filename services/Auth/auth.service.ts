import { createClient } from "@/supabase/client";
import { SignInParams, SignInResult } from "./types";

const MENSAGENS_DE_ERRO: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "E-mail ainda não confirmado.",
  over_request_rate_limit:
    "Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.",
  user_banned: "Este usuário está bloqueado. Fale com o administrador.",
};

export async function signInWithPassword({
  email,
  senha,
}: SignInParams): Promise<SignInResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (!error) return { error: null };

  const mensagem = error.code ? MENSAGENS_DE_ERRO[error.code] : undefined;

  return {
    error: mensagem ?? "Não foi possível entrar. Tente novamente.",
  };
}
