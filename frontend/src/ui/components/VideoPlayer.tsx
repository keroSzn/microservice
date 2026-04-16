import type { Video } from "../../lib/api";
import { api } from "../../lib/api";

export function VideoPlayer({
  video,
  posterUrl
}: {
  video: Video;
  posterUrl?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-black shadow-sm">
      <video
        className="aspect-video w-full"
        controls
        playsInline
        preload="metadata"
        poster={posterUrl ?? undefined}
      >
        <source src={api.videoStreamUrl(video.id)} type={video.mime_type} />
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{video.title}</div>
          <div className="text-xs text-slate-500">
            Video ID: {video.id}
          </div>
        </div>
        <a
          href={api.videoStreamUrl(video.id)}
          className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          target="_blank"
          rel="noreferrer"
        >
          Yeni sekmede aç
        </a>
      </div>
    </div>
  );
}

