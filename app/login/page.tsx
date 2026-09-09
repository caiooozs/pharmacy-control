import type { Metadata } from "next";

import Login from "@/components/Login/Login";

export const metadata: Metadata = {
  title: "Entrar | BM1 Farmácia",
  description: "Acesse o controle de estoque da BM1 Farmácia.",
};

export default function LoginPage() {
  return <Login />;
}
