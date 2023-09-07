import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const manifestForPlugin: Partial<VitePWAOptions>={
  registerType:"prompt",
  manifest:{
    name:"timer",
    short_name:"timer",
    description:"タイマー",
    theme_color:"#171717",
    background_color:"#e8ebf2",
    scope:"/",
    start_url:"/",
    orientation:"portrait"
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  base:"./",
  plugins: [
    react(),
    VitePWA({manifestForPlugin})],
});
