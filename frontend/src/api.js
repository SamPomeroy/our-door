import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

export async function login(password, role) {
  const { data } = await api.post("/auth/token", { password, role });
  return data;
}

export async function sendMessage(message, token, knockType = "hint") {
  const { data } = await api.post(
    "/chat",
    { message, knock_type: knockType },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function sendFeedback(logId, helpful, token) {
  const { data } = await api.post(
    "/feedback",
    { log_id: logId, helpful },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function getLogs(token) {
  const { data } = await api.get("/logs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
