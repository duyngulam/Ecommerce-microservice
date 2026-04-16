"use client";

import React, { useState } from "react";
import { signupApi } from "@/services/auth";
import { toast } from "sonner";
import {
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { KeyIcon, MailIcon, UserRound } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { FieldLabel } from "../ui/field";

type SignupFormProps = {
  switchToLogin: () => void;
};

export default function SignUpForm({ switchToLogin }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signupApi({ username, email, password });
      toast.success("Account created successfully! Please log in.");
      switchToLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6  py-6">
      <FieldSet>
        <FieldLegend className="w-full text-center font-bold ">
          Create your account
        </FieldLegend>
        <FieldGroup>
          <Field>
            <InputGroup>
              <InputGroupInput
                id="username"
                type="text"
                name="username"
                autoComplete="off"
                placeholder="Your username"
              />
              <InputGroupAddon>
                <UserRound />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <InputGroup>
              <InputGroupInput
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                placeholder="Enter your email"
              />
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <InputGroup>
              <InputGroupInput
                type="password"
                id="password"
                name="password"
                autoComplete="off"
                placeholder="Your Password"
              />
              <InputGroupAddon>
                <KeyIcon />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked />
            <FieldLabel
              htmlFor="checkout-7j9-same-as-shipping-wgm"
              className="font-normal"
            >
              I agree to all Terms & Conditions
            </FieldLabel>
          </Field>
        </FieldGroup>
        <FieldError>{error}</FieldError>
      </FieldSet>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-md"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      <p className="text-sm text-center text-muted-foreground">
        Đã có tài khoản?{" "}
        <span
          className="text-primary cursor-pointer hover:underline"
          onClick={switchToLogin}
        >
          Login
        </span>
      </p>
    </form>
  );
}
