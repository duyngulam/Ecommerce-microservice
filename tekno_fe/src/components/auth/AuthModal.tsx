"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthModalProps {
  mode: "login" | "register";
}

export function AuthModal({ mode }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">
        {isLogin ? "Login" : "Create Account"}
      </h2>

      <div className="space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && <Input placeholder="Confirm Password" type="password" />}
      </div>

      <Button className="w-full">{isLogin ? "Login" : "Create Account"}</Button>

      <p className="text-sm text-center text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span className="text-primary cursor-pointer hover:underline">
          {isLogin ? "Sign up now" : "Log in"}
        </span>
      </p>
    </div>
  );
}
