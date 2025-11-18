// CalendarView.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createCalendar, destroyCalendar } from '@event-calendar/core';
import { TimeGrid, ResourceTimeline, Interaction } from '@event-calendar/core';
import '@event-calendar/core/index.css';
import './CalendarView.css';

interface EventProps {
  id: string;
  resourceId?: string;
  title: string;
  start: Date; // Changed to Date
  end: Date; // Changed to Date
  extendedProps?: {
    userId?: string;
    description?: string;
    resourceId?: string;
    durationMinutes?: number;
    status?: string;
  };
}

interface ResourceProps {
  id: string;
  title: string;
  businessHours?: {
    startTime: string;
    endTime: string;
  };
}

interface CalendarViewProps {
  type?: 'user' | 'resource';
  events?: EventProps[];
  resources?: ResourceProps[];
  onEventChange?: (info: any) => void;
  onEventClick?: (event: any) => void;
  // NEW: Callback for date changes
  onDateChange?: (date: Date) => void;
  currentUserId?: string;
  height?: string;
  editable?: boolean;
  [key: string]: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  type = 'user',
  events = [],
  resources = [],
  onEventChange,
  onEventClick,
  onDateChange, // NEW: Destructure the new prop
  currentUserId,
  height = '600px',
  editable,
  ...otherOptions
}) => {
  const calendarApiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const handlePrev = () => {
    const stepDays = type === 'resource' ? 1 : 7;
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - stepDays);
    gotoDate(d);
  };

  const handleNext = () => {
    const stepDays = type === 'resource' ? 1 : 7;
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + stepDays);
    gotoDate(d);
  };

  const gotoDate = (date: Date) => {
    const api: any = calendarApiRef.current;
    if (!api) return;
    const viewType = type === 'resource' ? 'resourceTimelineDay' : 'timeGridWeek';
    if (typeof api.setOption === 'function') {
      api.setOption('view', viewType);
    }
    if (typeof api.gotoDate === 'function') {
      api.gotoDate(date);
    } else if (typeof api.changeView === 'function') {
      api.changeView(viewType, date);
    } else if (typeof api.setOption === 'function') {
      api.setOption('date', date);
    }
    setAnchorDate(date);
    if (showDatePicker) {
      setPickerDate(date);
    }
    // NEW: Call the onDateChange prop here
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const toggleDatePicker = () => {
    setPickerDate(anchorDate);
    setShowDatePicker((s) => !s);
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getMonthGrid = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const handleMiniPick = (day: number | null) => {
    if (!day) return;
    const y = pickerDate.getFullYear();
    const m = pickerDate.getMonth();
    const d = new Date(y, m, day);
    gotoDate(d);
    setShowDatePicker(false);
  };

  const prevMonth = () => {
    const d = new Date(pickerDate);
    d.setMonth(d.getMonth() - 1);
    setPickerDate(d);
  };

  const nextMonth = () => {
    const d = new Date(pickerDate);
    d.setMonth(d.getMonth() + 1);
    setPickerDate(d);
  };

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!showDatePicker) return;
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [showDatePicker]);

  const getPlugins = useCallback(() => {
    const plugins = [Interaction];
    if (type === 'resource') {
      plugins.push(ResourceTimeline);
    } else {
      plugins.push(TimeGrid);
    }
    return plugins;
  }, [type]);

  const getOptions = useCallback(() => {
    let filteredEvents = events;
    if (type === 'user' && currentUserId) {
      filteredEvents = events.filter(
        (event) => event.extendedProps?.userId === currentUserId
      );
    }

    const isEditable = editable !== undefined ? editable : type === 'resource';

    const baseOptions: any = {
      ...otherOptions,
      view: type === 'resource' ? 'resourceTimelineDay' : 'timeGridWeek',
      events: filteredEvents,
      resources,
      editable: isEditable,
      headerToolbar: false,
      slotDuration: '02:00:00',
      eventDrop: isEditable ? onEventChange : false,
      eventResize: isEditable ? onEventChange : false,
      eventStartEditable: isEditable,
      eventDurationEditable: isEditable,
      eventResizable: isEditable,
      height: '100%',
      eventBackgroundColor: '#3788d8',
      eventBorderColor: '#3788d8',
      eventTextColor: '#fff',
      dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric' },
      eventDuration: '04:00:00',
      defaultTimedEventDuration: '04:00:00',
      eventClick: onEventClick
        ? (clickInfo: any) => {
          if (clickInfo?.event) {
            onEventClick(clickInfo.event);
          }
        }
        : undefined,
    };

    if (type === 'resource') {
      baseOptions.datesAboveResources = true;
      baseOptions.slotLabelInterval = '02:00';
      baseOptions.resourceAreaHeaderContent = 'Users';
      baseOptions.initialView = 'resourceTimelineDay';
    } else {
      baseOptions.allDaySlot = false;
      baseOptions.slotLabelFormat = {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        hour12: false,
      };
      baseOptions.initialView = 'timeGridWeek';
    }

    return baseOptions;
  }, [
    type,
    events,
    resources,
    onEventChange,
    onEventClick,
    currentUserId,
    editable,
    otherOptions,
  ]);

  useEffect(() => {
    if (containerRef.current && !calendarApiRef.current) {
      const plugins = getPlugins();
      const options = getOptions();
      const calendarApi = createCalendar(containerRef.current, plugins, options);
      calendarApiRef.current = calendarApi;

      return () => {
        if (calendarApi) {
          destroyCalendar(calendarApi);
          calendarApiRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    const api = calendarApiRef.current;
    if (api) {
      const options = getOptions();
      api.setOption('events', options.events);
      if (resources.length > 0) {
        api.setOption('resources', options.resources);
      }

      const targetView =
        type === 'resource' ? 'resourceTimelineDay' : 'timeGridWeek';
      api.setOption('view', targetView);
      api.setOption('editable', options.editable);
      api.setOption('eventDrop', options.eventDrop);
      api.setOption('eventResize', options.eventResize);
      api.setOption('eventStartEditable', options.eventStartEditable);
      api.setOption('eventDurationEditable', options.eventDurationEditable);
      api.setOption('eventResizable', options.eventResizable);

      api.setOption('headerToolbar', options.headerToolbar);

      if (options.eventClick) {
        api.setOption('eventClick', options.eventClick);
      }
    }
  }, [getOptions]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    };
    return new Intl.DateTimeFormat('en-GB', options)
      .format(date)
      .replace(/,/, '');
  };




  return (
    <div className="calendar-container" style={{ height }}>
      {(type === 'user' || type === 'resource') && (
        <div className="calendar-controls">
          <button className="cal-btn" onClick={handlePrev} title={type === 'resource' ? 'Previous day' : 'Previous week'}>‹</button>
          <span className="current-date-display">{formatDate(anchorDate)}</span>
          <button className="cal-btn" onClick={handleNext} title={type === 'resource' ? 'Next day' : 'Next week'}>›</button>
          <div className="cal-picker">
            <button
              className="cal-icon-btn"
              onClick={toggleDatePicker}
              title="Pick a date"
              aria-label="Open date picker"
            >
              📅
            </button>
            {showDatePicker && (
              <div className="date-popover" ref={popoverRef}>
                <div className="mini-cal">
                  <div className="mini-cal-header">
                    <button className="mini-cal-nav" onClick={prevMonth} aria-label="Previous month">‹</button>
                    <div className="mini-cal-title">
                      {pickerDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                    <button className="mini-cal-nav" onClick={nextMonth} aria-label="Next month">›</button>
                  </div>
                  <div className="mini-cal-weekdays">
                    {weekDays.map((wd) => (
                      <div key={wd} className="mini-cal-wd">{wd}</div>
                    ))}
                  </div>
                  <div className="mini-cal-days">
                    {getMonthGrid(pickerDate).map((day, idx) => {
                      if (day === null) return <div key={idx} className="mini-cal-empty" />;
                      const cellDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
                      const isToday = isSameDay(cellDate, new Date());
                      const isSelected = isSameDay(cellDate, anchorDate);
                      return (
                        <button
                          key={idx}
                          className={'mini-cal-day' + (isSelected ? ' selected' : '') + (isToday ? ' today' : '')}
                          onClick={() => handleMiniPick(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={containerRef} className="calendar-element" />
    </div>
  );
};

export default CalendarView;