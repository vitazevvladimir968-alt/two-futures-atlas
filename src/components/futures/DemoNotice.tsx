import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";

export function DemoTag({ children = "Демо-индекс" }: { children?: string }) {
  return <span className="demo-tag">{children}</span>;
}

export function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs leading-relaxed text-muted-foreground ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p>
        Все числа — <strong className="text-foreground">демонстрационные модельные индексы</strong> (0–100), а не реальные
        измерения и не прогноз. Модель упрощена, параметры заданы вручную, неопределённость растёт с горизонтом.{" "}
        <Link to="/methodology" className="text-scenario underline underline-offset-2">
          Методика и ограничения
        </Link>
      </p>
    </div>
  );
}