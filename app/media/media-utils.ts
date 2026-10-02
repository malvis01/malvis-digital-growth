export function detectPlatform(raw: string) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (["youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) return "youtube";
    if (["facebook.com", "fb.watch", "m.facebook.com", "web.facebook.com", "fb.com"].includes(host)) return "facebook";
    if (host === "instagram.com") return "instagram";
    if (host === "tiktok.com") return "tiktok";
    if (host === "x.com" || host === "twitter.com") return "x";
    return null;
  } catch {
    return null;
  }
}

export function getEmbedUrl(raw: string, platform: string | null) {
  try {
    const u = new URL(raw);

    if (platform === "youtube") {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1).split("/")[0]
        : u.searchParams.get("v") || u.pathname.match(/\/shorts\/([^/]+)/)?.[1];
      return id
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
        : null;
    }

    if (platform === "facebook") {
      // Facebook's video plugin is required for hosted Facebook videos.
      // This also supports public facebook.com/share/v/... URLs when Facebook
      // permits the referenced video to be embedded.
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false&width=560`;
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
  } catch {
    return null;
  }
}
