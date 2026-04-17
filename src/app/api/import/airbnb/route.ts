import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface GeocodedStay {
  trip_id: string;
  listingName: string;
  listingAddress: string;
  checkIn: string;
  checkOut: string;
  lat: number;
  lng: number;
}

export async function POST(request: Request) {
  // Verify admin session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stays } = (await request.json()) as { stays: GeocodedStay[] };
  if (!stays?.length) {
    return NextResponse.json({ error: "No stays provided" }, { status: 400 });
  }

  const admin = createAdminClient();
  const created: string[] = [];

  for (const stay of stays) {
    if (!stay.lat || !stay.lng) continue;

    try {
      const { data } = await admin
        .from("points_of_interest")
        .insert({
          trip_id: stay.trip_id,
          title: stay.listingName || stay.listingAddress,
          description: stay.listingAddress,
          type: "stay",
          latitude: stay.lat,
          longitude: stay.lng,
          visit_date: stay.checkIn ? new Date(stay.checkIn).toISOString() : null,
        })
        .select()
        .single();

      if (data) created.push(data.id);
    } catch {
      // skip
    }
  }

  return NextResponse.json({ created });
}
