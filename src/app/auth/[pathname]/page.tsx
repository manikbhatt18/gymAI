"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react";
import { useParams } from "next/navigation";

export default function Auth() {
  const params = useParams();
  const pathname = params?.pathname as string;
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* default by neon */}
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
}
