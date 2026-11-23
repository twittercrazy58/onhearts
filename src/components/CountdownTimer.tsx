'use client';

import { useEffect, useState } from 'react';

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) return;

    const updateTimer = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-md mx-auto my-8">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
      ].map((unit) => (
        <div
          key={unit.label}
          className="rounded-2xl border border-current/15 bg-white/10 backdrop-blur-md p-3 sm:p-4 text-center"
        >
          <div className="font-serif text-2xl sm:text-4xl font-semibold">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-[11px] uppercase tracking-widest opacity-75 mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}