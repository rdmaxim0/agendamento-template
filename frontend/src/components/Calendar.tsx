import { useState } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface CalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = startOfToday(); // hoje às 00:00
  const [month, setMonth] = useState(today); // mês que está sendo exibido

  // Monta TODOS os dias que aparecem na grade: do domingo da primeira
  // semana até o sábado da última (inclui dias do mês anterior/seguinte).
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div className="calendar">
      <div className="calendar__header">
        {/* Não deixa voltar para meses que já passaram */}
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          disabled={isSameMonth(month, today)}
          aria-label="Mês anterior"
        >
          <CaretLeft size={20} />
        </button>

        {/* "MMMM yyyy" -> "outubro 2026" (em português por causa do ptBR) */}
        <strong>{format(month, 'MMMM yyyy', { locale: ptBR })}</strong>

        <button type="button" onClick={() => setMonth(addMonths(month, 1))} aria-label="Próximo mês">
          <CaretRight size={20} />
        </button>
      </div>

      <div className="calendar__grid">
        {WEEKDAYS.map((label, index) => (
          <span key={index} className="calendar__weekday">
            {label}
          </span>
        ))}

        {days.map((day) => {
          const isPast = isBefore(day, today); // dias anteriores a hoje
          const isOtherMonth = !isSameMonth(day, month);
          const isSelected = selected !== null && isSameDay(day, selected);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast || isOtherMonth}
              onClick={() => onSelect(day)}
              className={`calendar__day ${isSelected ? 'calendar__day--selected' : ''}`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}