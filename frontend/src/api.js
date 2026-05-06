import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function login(password, role) {
  const { data } = await api.post("/auth/token", { password, role });
  return data;
}

export async function sendMessage(message, token) {
  const { data } = await api.post(
    "/chat",
    { message },
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
