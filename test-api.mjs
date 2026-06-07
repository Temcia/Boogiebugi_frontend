import fetch from "node-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function run() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const json = await res.json();
    console.log("Success:", json.success);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
