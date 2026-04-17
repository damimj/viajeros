import { Suspense } from "react";
import { PublicMapView } from "@/components/map/public-map-view";
import { ServiceWorkerRegistration } from "@/components/shared/sw-register";

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen">
      <ServiceWorkerRegistration />
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-muted-foreground">
            Loading map...
          </div>
        }
      >
        <PublicMapView />
      </Suspense>
    </main>
  );
}
