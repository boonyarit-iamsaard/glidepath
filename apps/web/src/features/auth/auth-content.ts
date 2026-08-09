/**
 * Every string the auth feature shows to a person. The components read text
 * from here, so they hold no copy of their own.
 */
export const authContent = {
  signIn: {
    title: "Welcome back",
    description: "Sign in with your email and password",
    fields: {
      email: {
        label: "Email",
        placeholder: "m@example.com",
      },
      password: {
        label: "Password",
      },
    },
    submit: {
      idle: "Sign in",
      pending: "Signing in...",
    },
    footer: {
      prompt: "Do not have an account?",
      link: "Sign up",
    },
    toast: {
      success: "Sign in successful",
    },
    validation: {
      email: "Invalid email address",
      password: "Password must be at least 8 characters",
    },
  },
  signUp: {
    title: "Create your account",
    description: "Sign up with your email and password",
    fields: {
      name: {
        label: "Name",
        placeholder: "Ada Lovelace",
      },
      email: {
        label: "Email",
        placeholder: "m@example.com",
      },
      password: {
        label: "Password",
      },
    },
    submit: {
      idle: "Sign up",
      pending: "Creating account...",
    },
    footer: {
      prompt: "Already have an account?",
      link: "Sign in",
    },
    toast: {
      success: "Sign up successful",
    },
    validation: {
      name: "Name must be at least 2 characters",
      email: "Invalid email address",
      password: "Password must be at least 8 characters",
    },
  },
  userMenu: {
    signInLabel: "Sign In",
    accountLabel: "My Account",
    signOutLabel: "Sign Out",
  },
  navUser: {
    accountLabel: "Account",
    signOutLabel: "Sign out",
  },
} as const;
