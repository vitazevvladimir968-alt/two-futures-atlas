import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { ACHIEVEMENTS, INITIATIVES, type Milestone } from "@/lib/data";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Глобальные достижения человечества — TWO FUTURES" },
      {
        name: "description",
        content: "Что уже удалось сделать вместе: искоренение оспы, Монреальский протокол, МКС, геном человека — и проверяемые международные инициативы со ссылками на первоисточники.",
      },
      { property: "og:title", content: "Глобальные достижения и инициативы — TWO FUTURES" },
      { property: "og:description", content: "Реальные результаты международного сотрудничества со ссылками на официальные источники." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Achievements,
});

function Card({ m }: { m: Milestone }) {
  return (
    <li className="panel flex flex-col gap-2 p-4">
      <span className="font-mono text-xs text-scenario">{m.year}</span>
      <h3 className="font-sans text-base font-semibold">{m.title}</h3>
      <p className="flex-1 text-sm text-muted-foreground">{m.text}</p>
      <a
        href={m.source.url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex min-h-9 items-center gap-1.5 self-start text-xs text-foreground underline-offset-2 hover:underline"
      >
        Источник: {m.source.label} <ExternalLink className="h-3 w-3" />
      </a>
    </li>
  );
}

function Achievements() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
      <header className="flex max-w-3xl flex-col gap-3">
        <span className="eyebrow">Это уже произошло</span>
        <h1 className="text-2xl font-semibold sm:text-4xl">Глобальные достижения человечества</h1>
        <p className="text-sm text-muted-foreground">
          В отличие от сценариев на глобусе, здесь — реальные события. Каждая карточка ведёт на официальный сайт
          организации; перед цитированием сверяйте формулировки и цифры с первоисточником.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Достигнутые результаты</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((m) => (
            <Card key={m.title} m={m} />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Проверяемые инициативы</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Действующие международные программы и соглашения. Их текущий статус и результаты публикуются на официальных
          сайтах — здесь мы не оцениваем их эффективность.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INITIATIVES.map((m) => (
            <Card key={m.title} m={m} />
          ))}
        </ul>
      </section>
    </div>
  );
}