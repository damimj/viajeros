import { Suspense } from "react";
import { MapView } from "@/components/map/map-view";
import { ServiceWorkerRegistration } from "@/components/shared/sw-register";

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-slate-100 text-muted-foreground">
            Loading map...
          </div>
        }
      >
        <MapView />
      </Suspense>
      <ServiceWorkerRegistration />
    </main>
  );
}
