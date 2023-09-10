import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

const manifestForPlugin = {
  name: "timer",
  short_name: "timer",
  description: "タイマー",
  theme_color: "#171717",
  background_color: "#e8ebf2",
  scope: "/",
  start_url: "/",
};
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), VitePWA({ manifest: manifestForPlugin })],
});
