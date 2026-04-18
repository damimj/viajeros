import { describe, it, expect } from "vitest";
import { parseSettings } from "@/lib/utils/parse-settings";
import { DEFAULT_TRANSPORT_COLORS } from "@/lib/constants";
import type { Setting } from "@/types/domain";

function makeRow(key: string, value: string): Setting {
  return {
    id: key,
    setting_key: key,
    setting_value: value,
    setting_type: "string",
    description: "",
    created_at: "",
    updated_at: "",
  };
}

describe("parseSettings", () => {
  it("returns defaults when rows is empty", () => {
    const settings = parseSettings([]);
    expect(settings.mapStyle).toBe("voyager");
    expect(settings.clusterEnabled).toBe(true);
    expect(settings.clusterMaxRadius).toBe(30);
    expect(settings.clusterDisableAtZoom).toBe(15);
    expect(settings.imageMaxWidth).toBe(1920);
    expect(settings.imageMaxHeight).toBe(1080);
    expect(settings.imageQuality).toBe(85);
    expect(settings.thumbnailMaxWidth).toBe(400);
    expect(settings.thumbnailMaxHeight).toBe(300);
    expect(settings.thumbnailQuality).toBe(80);
    expect(settings.maxUploadSize).toBe(8388608);
    expect(settings.siteTitle).toBe("Viajeros");
    expect(settings.siteDescription).toBe("");
    expect(settings.distanceUnit).toBe("km");
    expect(settings.defaultLanguage).toBe("en");
    expect(settings.tripTagsEnabled).toBe(true);
    expect(settings.tripTimelineShowRoutes).toBe(false);
  });

  it("overrides mapStyle from rows", () => {
    const settings = parseSettings([makeRow("map_style", "dark-matter")]);
    expect(settings.mapStyle).toBe("dark-matter");
  });

  it("parses clusterEnabled as boolean true", () => {
    expect(parseSettings([makeRow("map_cluster_enabled", "true")]).clusterEnabled).toBe(true);
  });

  it("parses clusterEnabled as boolean false", () => {
    expect(parseSettings([makeRow("map_cluster_enabled", "false")]).clusterEnabled).toBe(false);
  });

  it("parses numeric settings", () => {
    const settings = parseSettings([
      makeRow("map_cluster_max_radius", "50"),
      makeRow("image_quality", "70"),
      makeRow("max_upload_size", "1000000"),
    ]);
    expect(settings.clusterMaxRadius).toBe(50);
    expect(settings.imageQuality).toBe(70);
    expect(settings.maxUploadSize).toBe(1000000);
  });

  it("overrides a transport color", () => {
    const settings = parseSettings([makeRow("transport_color_plane", "#ff0000")]);
    expect(settings.transportColors.plane).toBe("#ff0000");
  });

  it("keeps default transport colors for unset transports", () => {
    const settings = parseSettings([makeRow("transport_color_plane", "#ff0000")]);
    expect(settings.transportColors.car).toBe(DEFAULT_TRANSPORT_COLORS.car);
    expect(settings.transportColors.bike).toBe(DEFAULT_TRANSPORT_COLORS.bike);
  });

  it("parses distanceUnit", () => {
    const settings = parseSettings([makeRow("distance_unit", "mi")]);
    expect(settings.distanceUnit).toBe("mi");
  });

  it("parses defaultLanguage", () => {
    const settings = parseSettings([makeRow("default_language", "es")]);
    expect(settings.defaultLanguage).toBe("es");
  });

  it("parses siteTitle and siteDescription", () => {
    const settings = parseSettings([
      makeRow("site_title", "My Travel Blog"),
      makeRow("site_description", "Adventures around the world"),
    ]);
    expect(settings.siteTitle).toBe("My Travel Blog");
    expect(settings.siteDescription).toBe("Adventures around the world");
  });

  it("parses tripTagsEnabled as false", () => {
    const settings = parseSettings([makeRow("trip_tags_enabled", "false")]);
    expect(settings.tripTagsEnabled).toBe(false);
  });

  it("parses tripTimelineShowRoutes as true", () => {
    const settings = parseSettings([makeRow("trip_timeline_show_routes", "true")]);
    expect(settings.tripTimelineShowRoutes).toBe(true);
  });
});
