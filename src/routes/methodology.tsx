import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { TEXTURE_SOURCES } from "@/lib/data";
import { BASELINE, METRICS, TARGET_100 } from "@/lib/model";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Методика, ограничения и источники — TWO FUTURES" },
      {
        name: "description",
        content: "Как устроены демонстрационные индексы TWO FUTURES, почему это не прогноз, как задана неопределённость и откуда взяты изображения Земли.",
      },
      { property: "og:title", content: "Методика и источники — TWO FUTURES" },
      { property: "og:description", content: "Ограничения модели, неопределённость и точные источники изображений NASA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Methodology,
});

function Methodology() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-3">
        <span className="eyebrow">Методика</span>
        <h1 className="text-2xl font-semibold sm:text-4xl">Что это за числа и чего они не значат</h1>
      </header>

      <section className="panel flex flex-col gap-3 p-5 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">Демонстрационная модель</h2>
        <p>
          Все показатели — <strong>условные индексы от 0 до 100</strong>, заданные вручную для наглядности. Они{" "}
          <strong>не являются измерениями</strong>, не откалиброваны по статистике и <strong>не являются прогнозом</strong>.
        </p>
        <p className="text-muted-foreground">
          Для каждого показателя оба сценария стартуют в 2025 году с одного уровня и плавно приближаются к условным
          значениям 2125 года: значение = старт + (цель − старт) × (1 − e^(−k·t)) / (1 − e^(−k)), где t — доля
          пройденных 100 лет, а k задаёт скорость отклика показателя. Регионы сдвигают стартовый уровень и
          чувствительность к сценарию.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left font-mono text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-normal">Индекс</th>
                <th className="py-2 pr-3 font-normal">2025</th>
                <th className="py-2 pr-3 font-normal">2125 · сотрудничество</th>
                <th className="py-2 font-normal">2125 · противостояние</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-2 pr-3 font-sans">{m.name}</td>
                  <td className="py-2 pr-3">{BASELINE[m.id]}</td>
                  <td className="py-2 pr-3 text-coop">{TARGET_100.cooperation[m.id]}</td>
                  <td className="py-2 text-conf">{TARGET_100.confrontation[m.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel flex flex-col gap-3 p-5 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">Неопределённость и ограничения</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            Полоса неопределённости иллюстративна: ±2 пункта в 2025 году, растёт линейно до ±18 к 2125 году и в 1,25
            раза шире для сценария противостояния. Это не статистический доверительный интервал.
          </li>
          <li>Модель не учитывает демографию, экономику, технологические прорывы, катастрофы и обратные связи.</li>
          <li>Два сценария — крайние упрощения; реальный мир может сочетать черты обоих.</li>
          <li>Тексты о регионах с пометкой «сценарный нарратив» вымышлены и служат иллюстрацией.</li>
          <li>
            Цветовые изменения поверхности Земли при смене сценария — визуальная метафора, а не моделирование
            растительности или климата.
          </li>
          <li>Для городов индексы не рассчитываются: маркеры показывают только их расположение.</li>
        </ul>
      </section>

      <section className="panel flex flex-col gap-3 p-5 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">Изображения Земли</h2>
        <p className="text-muted-foreground">
          Глобус использует архивные мозаики, а <strong className="text-foreground">не live-спутниковую съёмку</strong>.
          Файлы уменьшены до 2048 px (3840 px для дневной поверхности на больших экранах) и хранятся вместе с
          приложением. Если файл не загрузился, глобус показывает упрощённый резервный слой и сообщает об этом.
        </p>
        <ul className="flex flex-col gap-3">
          {TEXTURE_SOURCES.map((s) => (
            <li key={s.layer} className="rounded-lg border border-border p-3">
              <p className="eyebrow">{s.layer}</p>
              <p className="mt-1">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                {s.date} · {s.origin} · {s.license}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
              >
                Страница файла <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Положение Солнца (граница дня и ночи) рассчитывается по упрощённым астрономическим формулам для текущего
          времени вашего устройства с точностью порядка ±0,5°. Архивные снимки MODIS по датам и цифровая модель рельефа
          AWS Terrarium в этой версии не используются.
        </p>
      </section>
    </div>
  );
}