import https from "https";
import crypto from "crypto";

function normalizeVin(v) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function isValidVinFormat(vin) {
  // VIN is 17 chars, excludes I/O/Q.
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data || "{}");
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

function sha1Hex(input) {
  return crypto.createHash("sha1").update(String(input), "utf8").digest("hex");
}

function normalizeLabelKey(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "_");
}

function asLabelMap(decodeArray) {
  const out = {};
  if (!Array.isArray(decodeArray)) return out;
  for (const item of decodeArray) {
    const labelKey = normalizeLabelKey(item?.label);
    const value = String(item?.value || "").trim();
    if (!labelKey) continue;
    // Prefer the first non-empty value we see for a label.
    if (!out[labelKey] && value) out[labelKey] = value;
  }
  return out;
}

function pickLabel(labels, ...keys) {
  for (const k of keys) {
    const key = normalizeLabelKey(k);
    const v = String(labels?.[key] || "").trim();
    if (v) return v;
  }
  return "";
}

function pickFirstResult(payload) {
  const results = payload?.Results;
  if (!Array.isArray(results) || results.length === 0) return null;
  return results[0] || null;
}

function pickStr(...vals) {
  for (const v of vals) {
    const s = String(v || "").trim();
    if (s) return s;
  }
  return "";
}

function suggestTruckType(fields) {
  const vehicleType = String(fields?.VehicleType || "").toLowerCase();
  const bodyClass = String(fields?.BodyClass || "").toLowerCase();
  const makeModel = `${String(fields?.Make || "")} ${String(fields?.Model || "")}`.toLowerCase();

  const hay = `${vehicleType} ${bodyClass} ${makeModel}`;

  const hasTruckish =
    hay.includes("truck") ||
    hay.includes("rigid") ||
    hay.includes("box") ||
    hay.includes("straight") ||
    hay.includes("lorry") ||
    hay.includes("heavy") ||
    hay.includes("commercial vehicle");

  const hasVanish = hay.includes("van") || hay.includes("cargo van") || hay.includes("minivan");

  // Brand/model hints for tractor units where body class isn't explicit.
  // DAF XG / XF are typically tractor units (semi tractors).
  const isDaf = hay.includes("daf");
  const isDafTractorSeries = /\b(xg\+?|xf)\b/.test(hay);

  if (hay.includes("truck tractor") || hay.includes("tractor")) return "Tractor unit";
  if (isDaf && isDafTractorSeries) return "Tractor unit";
  if (hay.includes("refrigerated") || hay.includes("reefer")) return "Refrigerated (reefer) truck";
  if (hay.includes("flatbed")) return "Flatbed truck";
  if (hay.includes("tanker")) return "Tanker truck";
  if (hay.includes("dump") || hay.includes("tip")) return "Tip truck / dumper";
  if (hay.includes("rigid") || hay.includes("box") || hay.includes("straight truck")) return "Rigid / box truck";

  // Only call it a van when it's van-like and not also clearly truck/box/rigid.
  if (hasVanish && !hasTruckish) return "Van (light commercial)";
  if (hasTruckish) return "Rigid / box truck";

  return "";
}

function modelYearCandidatesFromVin(vin) {
  const v = normalizeVin(vin);
  if (v.length !== 17) return [];
  const code = v[9]; // 10th character (0-based index 9)

  // VIN year code map for 1980-2009, repeats every 30 years.
  const map = {
    A: 1980,
    B: 1981,
    C: 1982,
    D: 1983,
    E: 1984,
    F: 1985,
    G: 1986,
    H: 1987,
    J: 1988,
    K: 1989,
    L: 1990,
    M: 1991,
    N: 1992,
    P: 1993,
    R: 1994,
    S: 1995,
    T: 1996,
    V: 1997,
    W: 1998,
    X: 1999,
    Y: 2000,
    1: 2001,
    2: 2002,
    3: 2003,
    4: 2004,
    5: 2005,
    6: 2006,
    7: 2007,
    8: 2008,
    9: 2009,
  };

  const base = map[code];
  if (!base) return [];

  const nowYear = new Date().getFullYear();
  const maxYear = nowYear + 2;
  const candidates = [];
  for (let y = base; y <= maxYear; y += 30) candidates.push(y);
  return candidates;
}

function coerceYearToVinCandidates(vin, year) {
  const y = Number(year);
  if (!Number.isFinite(y) || !y) return null;
  const candidates = modelYearCandidatesFromVin(vin);
  if (!candidates.length) return y;

  const nowYear = new Date().getFullYear();
  const maxYear = nowYear + 2;
  const minYear = 1980;

  // If the provider returned a reasonable year, do NOT override it.
  // Some providers return registration/production/model year inconsistently,
  // and forcing VIN-year can be wrong for some non-standard VIN schemes.
  if (y >= minYear && y <= maxYear) return y;

  // Only when the year is clearly out-of-range do we attempt to coerce.
  if (candidates.includes(y)) return y;

  // Pick closest candidate.
  let best = candidates[0];
  for (const c of candidates) {
    if (Math.abs(c - y) < Math.abs(best - y)) best = c;
  }
  return best;
}

async function decodeWithVincario(vin) {
  const apiKey = String(process.env.VINDECODER_EU_API_KEY || "").trim();
  const secretKey = String(process.env.VINDECODER_EU_SECRET_KEY || "").trim();
  const apiPrefix = String(process.env.VINDECODER_EU_API_PREFIX || "https://api.vindecoder.eu/3.2").trim();

  if (!apiKey || !secretKey) {
    return null;
  }

  // Vincario/Vindecoder signature scheme (per their docs)
  const id = "decode";
  const controlSum = sha1Hex(`${vin}|${id}|${apiKey}|${secretKey}`).slice(0, 10);
  const url = `${apiPrefix}/${encodeURIComponent(apiKey)}/${encodeURIComponent(controlSum)}/${id}/${encodeURIComponent(vin)}.json`;

  const payload = await fetchJson(url);
  const labels = asLabelMap(payload?.decode);

  const make = pickStr(
    pickLabel(labels, "make"),
    pickLabel(labels, "manufacturer"),
    pickLabel(labels, "manufacturer_name"),
    pickLabel(labels, "brand")
  );
  const model = pickStr(pickLabel(labels, "model"), pickLabel(labels, "model_name"));
  const yearStr = pickStr(
    pickLabel(labels, "model_year"),
    pickLabel(labels, "production_year"),
    pickLabel(labels, "year")
  );
  const year = yearStr ? Number(yearStr) : null;

  const vehicleType = pickStr(
    pickLabel(labels, "product_type"),
    pickLabel(labels, "vehicle_type"),
    pickLabel(labels, "vehicle_category"),
    pickLabel(labels, "body")
  );
  const bodyClass = pickStr(
    pickLabel(labels, "body"),
    pickLabel(labels, "body_class"),
    pickLabel(labels, "cab_type"),
    pickLabel(labels, "series")
  );

  const modelName = pickStr(
    model,
    pickLabel(labels, "series"),
    pickLabel(labels, "trim"),
    pickLabel(labels, "variant"),
    bodyClass
  );
  const combinedModel = pickStr(
    [make, modelName].filter(Boolean).join(" "),
    modelName,
    make
  );

  const suggestedType = suggestTruckType({ VehicleType: vehicleType, BodyClass: bodyClass, Make: make, Model: combinedModel });
  const hasUseful = Boolean((Number.isFinite(year) && year) || combinedModel || suggestedType);
  if (!hasUseful) return null;

  const coercedYear = coerceYearToVinCandidates(vin, year);

  return {
    vin,
    year: Number.isFinite(coercedYear) ? coercedYear : (Number.isFinite(year) ? year : null),
    model: combinedModel || "",
    type: suggestedType || "",
    raw: {
      provider: "vincario",
      make,
      model: modelName,
      vehicleType,
      bodyClass,
    },
  };
}

async function decodeWithNhtsa(vin) {
  // NHTSA VPIC decoder (free). It does not guarantee all fields for all VINs.
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
  const payload = await fetchJson(url);
  const fields = pickFirstResult(payload);

  if (!fields) return null;

  const yearStr = pickStr(fields?.ModelYear);
  const year = yearStr ? Number(yearStr) : null;
  const coercedYear = coerceYearToVinCandidates(vin, year);

  // NHTSA data can be incomplete, especially for non‑US VINs.
  // Try multiple fields so we don't end up with only the maker/manufacturer.
  const make = pickStr(fields?.Make, fields?.ManufacturerName, fields?.Manufacturer);
  const modelName = pickStr(
    fields?.Model,
    fields?.ModelName,
    fields?.Series,
    fields?.Trim,
    // Last-resort: BodyClass is still more descriptive than only the maker.
    fields?.BodyClass
  );

  const combinedModel = pickStr(
    [make, modelName].filter(Boolean).join(" "),
    modelName,
    make
  );

  const suggestedType = suggestTruckType(fields);

  const hasUseful = Boolean((Number.isFinite(year) && year) || combinedModel || suggestedType);
  if (!hasUseful) return null;

  return {
    vin,
    year: Number.isFinite(coercedYear) ? coercedYear : (Number.isFinite(year) ? year : null),
    model: combinedModel || "",
    type: suggestedType || "",
    raw: {
      provider: "nhtsa",
      make,
      model: modelName,
      vehicleType: String(fields?.VehicleType || "").trim(),
      bodyClass: String(fields?.BodyClass || "").trim(),
    },
  };
}

// GET /api/vin/decode?vin=...
export const decodeVin = async (req, res) => {
  try {
    const vin = normalizeVin(req.query?.vin);
    if (!vin) {
      return res.status(400).json({ message: "VIN is required", field: "vin", code: "VIN_REQUIRED" });
    }
    if (!isValidVinFormat(vin)) {
      return res.status(400).json({ message: "VIN must be 17 characters", field: "vin", code: "VIN_INVALID" });
    }

    const provider = String(process.env.VIN_DECODER_PROVIDER || "").trim().toLowerCase();

    // Prefer an EU/global provider if configured; always keep NHTSA as fallback.
    // In auto mode, merge field-by-field to improve accuracy.
    let decodedVincario = null;
    let decodedNhtsa = null;

    if (provider === "nhtsa") {
      decodedNhtsa = await decodeWithNhtsa(vin);
    } else if (provider === "vincario" || provider === "vindecoder" || provider === "vindecoder_eu") {
      try {
        decodedVincario = await decodeWithVincario(vin);
      } catch {
        decodedVincario = null;
      }
      if (!decodedVincario) decodedNhtsa = await decodeWithNhtsa(vin);
    } else {
      // Auto mode: try both (best-effort) and merge.
      try {
        decodedVincario = await decodeWithVincario(vin);
      } catch {
        decodedVincario = null;
      }
      try {
        decodedNhtsa = await decodeWithNhtsa(vin);
      } catch {
        decodedNhtsa = null;
      }
    }

    const decoded = decodedVincario || decodedNhtsa;
    if (decodedVincario && decodedNhtsa) {
      // Merge: prefer vincario for model text (EU-friendly), but fill gaps from NHTSA.
      const mergedYear = decodedVincario.year ?? decodedNhtsa.year ?? null;
      const mergedModel = pickStr(decodedVincario.model, decodedNhtsa.model);
      const mergedType = pickStr(decodedVincario.type, decodedNhtsa.type);

      const finalYear = coerceYearToVinCandidates(vin, mergedYear);
      decoded.vin = vin;
      decoded.year = Number.isFinite(finalYear) ? finalYear : mergedYear;
      decoded.model = mergedModel || "";
      decoded.type = mergedType || "";
      decoded.raw = {
        provider: "auto",
        providers: {
          vincario: decodedVincario.raw,
          nhtsa: decodedNhtsa.raw,
        },
      };
    }

    if (!decoded) {
      return res.status(404).json({ message: "VIN not found", field: "vin", code: "VIN_NOT_FOUND" });
    }

    return res.status(200).json(decoded);
  } catch (error) {
    return res.status(500).json({ message: "Failed to decode VIN", error: error?.message || String(error) });
  }
};
