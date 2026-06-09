"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function FloatingAdmin() {
  const { data: session } = useSession();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {session ? (
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard"
            className="card-dark px-4 py-2.5 text-sm font-medium text-white no-underline hover:brightness-125"
          >
            Dashboard
          </Link>
          <button
            onClick={() => signOut()}
            className="card-dark px-4 py-2.5 text-sm font-medium text-white cursor-pointer hover:brightness-125"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/admin/login"
          className="card-dark px-4 py-2.5 text-sm font-medium text-white no-underline hover:brightness-125"
        >
          Admin
        </Link>
      )}
    </div>
  );
}
