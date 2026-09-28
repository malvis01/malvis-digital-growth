export function detectPlatform(raw: string) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") return "youtube";
    if (host === "facebook.com" || host === "fb.watch") return "facebook";
    if (host === "instagram.com") return "instagram";
    if (host === "tiktok.com") return "tiktok";
    if (host === "x.com" || host === "twitter.com") return "x";
    return null;
  } catch { return null; }
}

export function getEmbedUrl(raw: string, platform: string | null) {
  try {
    const u = new URL(raw);
    if (platform === "youtube") {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (platform === "facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false`;
    }
    if (platform === "instagram") {
      const m = u.pathname.match(/\/(reel|p|tv)\/([^/]+)/);
      return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
    }
    if (platform === "tiktok") {
      const m = u.pathname.match(/\/video\/(\d+)/);
      return m ? `https://www.tiktok.com/player/v1/${m[1]}` : null;
    }
    return null;
  } catch { return null; }
}
