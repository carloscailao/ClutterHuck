// app/(auth)/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabaseClient";
import { ActivityIndicator, View } from "react-native";
import type { Profiles } from "@/types/supabase";

export default function AuthIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Determine next onboarding step
  function getNextOnboardingStep(user: Profiles) {
    if (!user.firstName || !user.lastName || !user.username) return "./name" as const;
    if (!user.avatar_url) return "./avatar" as const;
    return "../../(tabs)/welcome" as const; // relative path from (auth) to (tabs)/welcome
  }

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        // No session → redirect to welcome
        if (!session?.user) {
          if (active) router.replace("./welcome" as const);
          return;
        }

        // Fetch profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_uid", session.user.id)
          .single<Profiles>();

        // No profile → register
        if (error || !profile) {
          if (active) router.replace("./register" as const);
          return;
        }

        // Redirect to next onboarding step
        const next = getNextOnboardingStep(profile);
        if (active) router.replace(next);
      } catch (err) {
        console.error("AuthIndex error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    checkUser();
    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}
