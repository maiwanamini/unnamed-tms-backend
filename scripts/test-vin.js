/* eslint-disable no-console */
const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data || "{}") });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function pick(...vals) {
  for (const v of vals) {
    const s = String(v || "").trim();
    if (s) return s;
  }
  return "";
}

async function main() {
  const vin = String(process.argv[2] || "").trim().toUpperCase();
  if (!vin) {
    console.error("Usage: node scripts/test-vin.js <VIN>");
    process.exit(1);
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
  const { status, json } = await fetchJson(url);
  const fields = Array.isArray(json?.Results) ? json.Results[0] : null;

  console.log("HTTP", status);
  if (!fields) {
    console.log("No Results[0]");
    return;
  }

  console.log({
    VIN: vin,
    Make: pick(fields.Make, fields.ManufacturerName, fields.Manufacturer),
    Model: pick(fields.Model, fields.ModelName, fields.Series, fields.Trim, fields.BodyClass),
    ModelYear: pick(fields.ModelYear),
    VehicleType: pick(fields.VehicleType),
    BodyClass: pick(fields.BodyClass),
    ErrorCode: pick(fields.ErrorCode),
    ErrorText: pick(fields.ErrorText),
  });
}

main().catch((e) => {
  console.error("Error", e && e.message ? e.message : String(e));
  process.exit(1);
});
