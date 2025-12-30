// Mapbox proxy endpoints (keeps token server-side)

const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_DIRECTIONS_BASE = "https://api.mapbox.com/directions/v5/mapbox";

function pickContext(ctx = []) {
  const out = { city: "", postalCode: "", region: "", district: "" };
  for (const item of Array.isArray(ctx) ? ctx : []) {
    const id = String(item?.id || "");
    if (!out.postalCode && id.startsWith("postcode")) out.postalCode = String(item?.text || "");
    if (!out.city && (id.startsWith("place") || id.startsWith("locality"))) out.city = String(item?.text || "");
    if (!out.region && id.startsWith("region")) out.region = String(item?.text || "");
    if (!out.district && id.startsWith("district")) out.district = String(item?.text || "");
  }
  return out;
}

// @desc    Autocomplete addresses (Mapbox forward geocoding)
// @route   GET /api/geo/autocomplete?q=...
// @access  Private
export async function autocomplete(req, res) {
  try {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ message: "MAPBOX_ACCESS_TOKEN is not configured" });
    }

    const q = String(req.query?.q || "").trim();
    if (q.length < 3) return res.status(200).json([]);

    const limit = Math.min(Math.max(Number(req.query?.limit) || 6, 1), 10);

    const url = new URL(`${MAPBOX_BASE}/${encodeURIComponent(q)}.json`);
    url.searchParams.set("access_token", token);
    url.searchParams.set("autocomplete", "true");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("types", "address,place,postcode");
    url.searchParams.set("language", "en");

    const r = await fetch(url.toString());
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(502).json({ message: "Mapbox request failed", status: r.status, details: text });
    }

    const data = await r.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const results = features
      .map((f) => {
        const coords = Array.isArray(f?.center) ? f.center : [];
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);

        const ctx = pickContext(f?.context);

        return {
          id: String(f?.id || ""),
          label: String(f?.place_name || f?.text || ""),
          placeName: String(f?.place_name || ""),
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null,
          city: ctx.city,
          postalCode: ctx.postalCode,
          // For many countries (incl. BE), province/county is exposed as "district".
          // "region" can be broader (e.g. Flanders), so prefer district when present.
          region: ctx.district || ctx.region,
        };
      })
      .filter((x) => x.label);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to autocomplete address", error: err?.message });
  }
}

// @desc    Driving distance (Mapbox Directions)
// @route   GET /api/geo/directions?fromLat=..&fromLng=..&toLat=..&toLng=..
// @access  Private
export async function directions(req, res) {
  try {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ message: "MAPBOX_ACCESS_TOKEN is not configured" });
    }

    const fromLat = Number(req.query?.fromLat);
    const fromLng = Number(req.query?.fromLng);
    const toLat = Number(req.query?.toLat);
    const toLng = Number(req.query?.toLng);

    const ok = [fromLat, fromLng, toLat, toLng].every((n) => Number.isFinite(n));
    if (!ok) {
      return res.status(400).json({ message: "fromLat/fromLng/toLat/toLng are required numbers" });
    }

    const profile = "driving";
    const coords = `${fromLng},${fromLat};${toLng},${toLat}`;
    const url = new URL(`${MAPBOX_DIRECTIONS_BASE}/${profile}/${coords}`);
    url.searchParams.set("access_token", token);
    url.searchParams.set("overview", "false");
    url.searchParams.set("alternatives", "false");
    url.searchParams.set("geometries", "geojson");

    const r = await fetch(url.toString());
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(502).json({ message: "Mapbox directions request failed", status: r.status, details: text });
    }

    const data = await r.json();
    const route = Array.isArray(data?.routes) ? data.routes[0] : null;
    const distanceMeters = Number(route?.distance);
    const durationSeconds = Number(route?.duration);

    if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds)) {
      return res.status(502).json({ message: "Mapbox directions response missing distance/duration" });
    }

    res.status(200).json({
      distanceMeters,
      durationSeconds,
      distanceKm: distanceMeters / 1000,
      durationMinutes: durationSeconds / 60,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch directions", error: err?.message });
  }
}
