import z from "zod";

import { authContent } from "../auth-content";

const PASSWORD_MIN_LENGTH = 8;
const NAME_MIN_LENGTH = 2;

export const signInSchema = z.object({
  email: z.email(authContent.signIn.validation.email),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, authContent.signIn.validation.password),
});

export const signUpSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH, authContent.signUp.validation.name),
  email: z.email(authContent.signUp.validation.email),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, authContent.signUp.validation.password),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
