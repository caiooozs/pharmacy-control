"use client";

import { LoginView } from "./Login.view";
import { useLoginViewModel } from "./Login.viewmodel";

export default function Login() {
  const viewLogic = useLoginViewModel();
  return <LoginView {...viewLogic} />;
}
