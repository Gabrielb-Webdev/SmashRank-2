'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'blue' | 'purple';
  min?: string;
  max?: string;
  required?: boolean;
}

const colorStyles = {
  red: {
    bg: 'rgba(220, 20, 60, 0.05)',
    border: 'rgba(220, 20, 60, 0.2)',
    borderFocus: '#dc143c',
    gradient: 'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(255, 69, 0, 0.1) 100%)',
    text: '#ffd700',
    button: 'from-red-500 to-orange-500',
    hover: 'hover:bg-red-500/10'
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.05)',
    border: 'rgba(34, 197, 94, 0.2)',
    borderFocus: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
    text: '#4ade80',
    button: 'from-green-500 to-emerald-500',
    hover: 'hover:bg-green-500/10'
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.05)',
    border: 'rgba(59, 130, 246, 0.2)',
    borderFocus: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
    text: '#60a5fa',
    button: 'from-blue-500 to-cyan-500',
    hover: 'hover:bg-blue-500/10'
  },
  purple: {
    bg: 'rgba(168, 85, 247, 0.05)',
    border: 'rgba(168, 85, 247, 0.2)',
    borderFocus: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
    text: '#c084fc',
    button: 'from-purple-500 to-pink-500',
    hover: 'hover:bg-purple-500/10'
  }
};

export default function DateTimePicker({ value, onChange, label, icon, color, min, max, required }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const styles = colorStyles[color];

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      adjustPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const adjustPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const modalHeight = 500; // Altura aproximada del modal

      // Si hay más espacio arriba que abajo, mostrar arriba
      if (spaceBelow < modalHeight && spaceAbove > spaceBelow) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  };

  const formatDisplayDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
    updateValue(newDate);
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newDate = new Date(selectedDate);
    if (type === 'hour') {
      newDate.setHours(value);
    } else {
      newDate.setMinutes(value);
    }
    setSelectedDate(newDate);
    updateValue(newDate);
  };

  const updateValue = (date: Date) => {
    // Formatear fecha en zona horaria local sin conversión a UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    onChange(formatted);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="relative" ref={pickerRef}>
      <div className="p-4 rounded-xl" style={{ background: styles.bg, border: `2px solid ${styles.border}` }}>
        <label className="label flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${styles.button} flex items-center justify-center`}>
            {icon}
          </div>
          <span>{label} {required && '*'}</span>
        </label>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left font-semibold transition-all"
          style={{
            background: styles.gradient,
            border: `2px solid ${isOpen ? styles.borderFocus : styles.border}`,
            borderRadius: '10px',
            padding: '12px 14px',
            color: styles.text,
            cursor: 'pointer',
          }}
        >
          <div className="flex items-center justify-between">
            <span>{value ? formatDisplayDate(selectedDate) : 'Seleccionar fecha y hora'}</span>
            <Calendar className="w-4 h-4" />
          </div>
        </button>

        {isOpen && (
          <div 
            className="absolute z-[100] rounded-xl shadow-2xl animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
              border: `2px solid ${styles.borderFocus}`,
              backdropFilter: 'blur(10px)',
              width: '600px',
              maxWidth: '95vw',
              top: '100%',
              marginTop: '8px',
              left: '0'
            }}
          >
            <div className="flex">
              {/* Panel izquierdo - Calendario */}
              <div className="flex-1 p-4 border-r" style={{ borderColor: styles.border }}>
                <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className={`p-2 rounded-lg transition-colors ${styles.hover}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-lg">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className={`p-2 rounded-lg transition-colors ${styles.hover}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs text-gray-400 font-semibold">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate.getDate() === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                        isSelected 
                          ? `bg-gradient-to-br ${styles.button} text-white shadow-lg` 
                          : `text-gray-300 ${styles.hover}`
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              </div>

              {/* Panel derecho - Hora */}
              <div className="w-56 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: styles.text }} />
                  <span className="font-semibold">Hora</span>
                </div>
                
                <div className="flex gap-3 mb-4">
                  {/* Horas */}
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-2 block">Hora</label>
                    <div className="h-48 overflow-y-auto custom-scrollbar rounded-lg" style={{ background: styles.bg }}>
                      {Array.from({ length: 24 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleTimeChange('hour', i)}
                          className={`w-full p-2 text-center text-sm font-semibold transition-colors ${
                            selectedDate.getHours() === i 
                              ? `bg-gradient-to-br ${styles.button} text-white` 
                              : `${styles.hover}`
                          }`}
                        >
                          {String(i).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutos */}
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-2 block">Min</label>
                    <div className="h-48 overflow-y-auto custom-scrollbar rounded-lg" style={{ background: styles.bg }}>
                      {Array.from({ length: 60 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleTimeChange('minute', i)}
                          className={`w-full p-2 text-center text-sm font-semibold transition-colors ${
                            selectedDate.getMinutes() === i 
                              ? `bg-gradient-to-br ${styles.button} text-white` 
                              : `${styles.hover}`
                          }`}
                        >
                          {String(i).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-2 px-4 rounded-lg font-bold bg-gradient-to-br ${styles.button} text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  ✓ Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
