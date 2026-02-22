const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function postJson(path) {
  const url = `${BACKEND_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return res.json();
}

export async function runBaselineSchedule() {
  const result = await postJson("/api/schedule/baseline");
  return result;
}

export async function runOptimizedSchedule() {
  const result = await postJson("/api/schedule/optimize");
  return result;
}

