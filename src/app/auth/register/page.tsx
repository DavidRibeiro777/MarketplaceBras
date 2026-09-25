// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      // Supabase pode exigir verificação de e‑mail; informamos o usuário
      setSuccessMsg("Cadastro realizado! Verifique seu e‑mail para confirmar.");
      // opcional: redirect para login após alguns segundos
      setTimeout(() => router.push("/auth/login"), 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-xl font-semibold text-center">Cadastro</h1>
        {errorMsg && (
          <p className="mb-2 rounded bg-red-100 p-2 text-sm text-red-600">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="mb-2 rounded bg-green-100 p-2 text-sm text-green-600">{successMsg}</p>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
