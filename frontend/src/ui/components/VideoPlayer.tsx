import type { Video } from "../../lib/api";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

export function VideoPlayer({ video }: { video: Video }) {
  const youtubeId = extractYoutubeId(video.youtube_url);

  if (!youtubeId) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border bg-white text-sm text-slate-600">
        Geçersiz video URL'si
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-black shadow-sm">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      </div>
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{video.title}</div>
        </div>
        <a
          href={video.youtube_url}
          className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          target="_blank"
          rel="noreferrer"
        >
          YouTube'da Aç
        </a>
      </div>
    </div>
  );
}
