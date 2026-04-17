import { Suspense } from "react";
import { MapView } from "@/components/map/map-view";
import { SWRegister } from "@/components/shared/sw-register";

export default function HomePage() {
  return (
    <>
      <SWRegister />
      <Suspense>
        <MapView />
      </Suspense>
    </>
  );
}
