"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[Viajeros] SW registered, scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[Viajeros] SW registration failed:", err);
        });
    }
  }, []);

  return null;
}
