import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { characters, shortDramas } from "../data/mock.js";

const previewVideos = [
  "/videos/feed/feed-01.mp4",
  "/videos/feed/feed-02.mp4",
  "/videos/feed/feed-03.mp4",
  "/videos/feed/feed-04.mp4",
];

const characterProfiles = [
  "Warm and observant, Lin notices the feelings hidden behind ordinary words and always listens without judgment.",
  "Composed and perceptive, Su asks difficult questions but reveals a thoughtful side when someone earns her trust.",
  "Curious and expressive, Lan can turn an ordinary encounter into an adventure no one planned.",
  "Steady and dependable, Jiran's quiet confidence makes people feel safe even when he has concerns of his own.",
  "A careful listener who remembers small details and often understands what others feel before a word is spoken.",
  "Energetic and imaginative, they challenge expectations and keep every conversation delightfully unpredictable.",
];

const openingDetails = [
  "A chance encounter begins with an ordinary conversation, but a small hesitation suggests that both characters are holding something back. As the city settles into the night, one unexpected question changes the tone between them and leaves the next decision unresolved.",
  "What starts as a simple exchange quickly becomes more personal than either character expected. A familiar detail connects them to an unfinished memory, while one carefully avoided answer creates the first crack in an otherwise calm meeting.",
  "Two people cross paths at exactly the wrong moment, each carrying a different reason to leave. Their brief conversation uncovers a misunderstanding that could pull them closer together or send them in completely different directions.",
  "An ordinary day is interrupted by news that neither character is prepared to face. Between duty, doubt, and an unspoken promise, they must decide whether to trust each other before the opportunity disappears.",
];

export default function Shorts() {
  const navigate = useNavigate();
  const stories = useMemo(() => {
    const characterById = new Map(characters.map((character) => [character.id, character]));
    return shortDramas
      .map((drama) => ({ drama, character: characterById.get(drama.characterId) }))
      .filter(({ character }) => character);
  }, []);

  const openFirstEpisode = (dramaId) => {
    navigate(`/shorts/${dramaId}?ep=1`);
  };

  const playPreview = (event) => {
    const video = event.currentTarget.querySelector("video");
    video?.play().catch(() => {});
  };

  const stopPreview = (event) => {
    const video = event.currentTarget.querySelector("video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <section className="relative overflow-hidden rounded-[32px] bg-zinc-950 px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            ORIGINAL STORY OPENINGS
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Every story starts here.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
            Watch the official first episode, meet the characters, and discover the moment where each story begins. What happens next will be up to you.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="grid gap-5 xl:grid-cols-2">
          {stories.map(({ drama, character }, index) => {
            const avatarSrc = character.avatarUrl || character.heroUrl || character.fallbackUrl;
            const profile = characterProfiles[index % characterProfiles.length];
            const openingDetail = openingDetails[index % openingDetails.length];
            const previewVideo = previewVideos[index % previewVideos.length];
            return (
              <article
                key={drama.id}
                className="group overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"
              >
                <div className="grid items-stretch sm:grid-cols-[200px_minmax(0,1fr)]">
                  <button
                    type="button"
                    onClick={() => openFirstEpisode(drama.id)}
                    onMouseEnter={playPreview}
                    onMouseLeave={stopPreview}
                    onFocus={playPreview}
                    onBlur={stopPreview}
                    className="group/video relative aspect-[9/16] w-full overflow-hidden rounded-[24px] bg-zinc-900 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80 sm:m-3 sm:w-[calc(100%-1.5rem)]"
                    aria-label={`Watch ${drama.title} episode 1`}
                  >
                    <img
                      src={drama.coverUrl}
                      alt={drama.title}
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover/video:opacity-0"
                    />
                    <video
                      src={previewVideo}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover/video:opacity-100"
                    />
                  </button>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">{drama.title}</h3>
                        <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-600">
                          {drama.description} {openingDetail}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                          {drama.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => openFirstEpisode(drama.id)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2"
                        >
                          Watch
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 bg-zinc-50/80 p-5">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={avatarSrc}
                          alt={character.name}
                          className="h-14 w-14 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-zinc-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-zinc-900">{character.name}</div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">{profile}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
