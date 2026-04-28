"use client";

import { AccountView } from "@neondatabase/neon-js/auth/react";
import { useParams } from "next/navigation";

export default function Account() {
  const params = useParams();
  const pathname = params?.pathname as string;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <AccountView pathname={pathname} />
      </div>
    </div>
  );
}
