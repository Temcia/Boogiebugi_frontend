import { getProducts } from "./lib/api";
async function run() {
  try {
    const res = await getProducts();
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
