"use client";

import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/supabase";

export default function LoginPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          // Can redirect to a specific page after sign-in, or let user navigate manually
          // For now, let's redirect to the admin test page as an example
          router.push("/admin-test");
        }
        // Optionally handle SIGNED_OUT or other events
      }
    );

    // Check if user is already logged in on mount
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin-test"); // Or wherever you want to redirect logged-in users
      }
    };

    checkUser();

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Simplex TCG Login
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["github"]} // Example: add 'google', 'azure' etc. if configured in Supabase
          redirectTo={`${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/auth/callback`}
          // socialLayout="horizontal" // Optional: if you prefer horizontal layout for social buttons
        />
      </div>
    </div>
  );
}
