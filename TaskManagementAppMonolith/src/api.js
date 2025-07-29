const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper for fetching JSON, handling errors
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }
  return data;
}

// PUBLIC_INTERFACE
export async function getTasks(params = {}) {
  const qp = new URLSearchParams(params);
  return fetchJSON(`${API_BASE}/tasks?${qp.toString()}`);
}

// PUBLIC_INTERFACE
export async function getTask(taskId) {
  return fetchJSON(`${API_BASE}/tasks/${taskId}`);
}

// PUBLIC_INTERFACE
export async function createTask(task) {
  return fetchJSON(`${API_BASE}/tasks`, {
    method: "POST",
    body: JSON.stringify(task),
  });
}

// PUBLIC_INTERFACE
export async function updateTask(taskId, updates) {
  return fetchJSON(`${API_BASE}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

// PUBLIC_INTERFACE
export async function deleteTask(taskId) {
  return fetchJSON(`${API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// PUBLIC_INTERFACE
export async function toggleTaskCompleted(taskId) {
  return fetchJSON(`${API_BASE}/tasks/${taskId}/toggle`, {
    method: "PATCH",
  });
}
