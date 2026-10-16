import React, { useState } from 'react';
import {
  ProductionPackage,
  BrandKey,
  Channel,
  BRANDS,
  CHANNEL_SPECS,
} from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  CalendarCheck,
  Send,
  Eye,
  X,
  Film,
  Camera,
} from 'lucide-react';

interface EditorialCalendarProps {
  drafts: ProductionPackage[];
  onSelectDraftForEdit?: (draft: ProductionPackage) => void;
  onNavigateToStudio?: (brandKey?: BrandKey) => void;
}

interface CalendarSlot {
  id: string;
  brandKey: BrandKey;
  channel: Channel;
  topic: string;
  hook?: string;
  magazineColumn?: string;
  dayOfWeek: number; // 0 = Mon, 6 = Sun
  timeStr: string;
  status: 'scheduled' | 'published' | 'approved' | 'draft';
  hasPhoto?: boolean;
  hasVideo?: boolean;
}

export const EditorialCalendar: React.FC<EditorialCalendarProps> = ({
  drafts,
  onSelectDraftForEdit,
  onNavigateToStudio,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandKey | 'ALL'>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<Channel | 'ALL'>('ALL');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New slot form state
  const [newBrandKey, setNewBrandKey] = useState<BrandKey>('bes_outkast');
  const [newChannel, setNewChannel] = useState<Channel>('LinkedIn');
  const [newTopic, setNewTopic] = useState<string>('Bespoke Tailoring & Structural Precision');
  const [newDay, setNewDay] = useState<number>(1); // Tuesday
  const [newTime, setNewTime] = useState<string>('10:00');
  const [newColumn, setNewColumn] = useState<string>('The Roped Shoulder');

  // Days of week
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate current week dates
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - currentDayIndex + weekOffset * 7);

  const weekDates = DAYS.map((dayName, idx) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + idx);
    return {
      dayName,
      dateNum: d.getDate(),
      monthName: d.toLocaleString('default', { month: 'short' }),
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  // Generate initial schedule slots derived from drafts and pre-calibrated slots
  const [slots, setSlots] = useState<CalendarSlot[]>([
    {
      id: 'slot-1',
      brandKey: 'bes_outkast',
      channel: 'Instagram',
      topic: 'The Roped Shoulder: Tailoring as Armor',
      hook: 'A natural shoulder yields to gravity. A roped shoulder commands posture.',
      magazineColumn: 'The Roped Shoulder',
      dayOfWeek: 0, // Mon
      timeStr: '10:00 EST',
      status: 'scheduled',
      hasPhoto: true,
      hasVideo: true,
    },
    {
      id: 'slot-2',
      brandKey: 'bhw_pr',
      channel: 'LinkedIn',
      topic: 'Executive Crisis Perimeter & Strategic Silence',
      hook: 'When an institutional boundary is breached, premature statements surrender control.',
      dayOfWeek: 1, // Tue
      timeStr: '08:30 EST',
      status: 'scheduled',
      hasPhoto: true,
    },
    {
      id: 'slot-3',
      brandKey: 'bes_outkast',
      channel: 'Pinterest',
      topic: 'Sharkskin Twill: The Micro-Weave Guide',
      hook: 'Two contrasting worsted yarns woven into subtle dimensional armor.',
      magazineColumn: 'Sharkskin Twill',
      dayOfWeek: 1, // Tue
      timeStr: '14:00 EST',
      status: 'scheduled',
      hasPhoto: true,
    },
    {
      id: 'slot-4',
      brandKey: 'nuecofab',
      channel: 'X',
      topic: 'Duty Cycle & Heavy Machinery Battery Architecture',
      hook: 'Industrial payloads do not forgive speculative greenwashing.',
      dayOfWeek: 2, // Wed
      timeStr: '09:15 EST',
      status: 'scheduled',
      hasVideo: true,
    },
    {
      id: 'slot-5',
      brandKey: 'bes_outkast',
      channel: 'Substack',
      topic: 'The Savile Row Ledger: Price of Provenance',
      hook: 'Why authentic hand-stitched canvassing survives fast-fashion obsolescence.',
      magazineColumn: 'The Savile Row Ledger',
      dayOfWeek: 3, // Thu
      timeStr: '11:00 EST',
      status: 'scheduled',
      hasPhoto: true,
    },
    {
      id: 'slot-6',
      brandKey: 'fyrrion',
      channel: 'Bluesky',
      topic: 'LOLBAS Command-Line Threat Hunting',
      hook: 'Attackers don’t bring new malware. They use your legitimate administrative tools.',
      dayOfWeek: 3, // Thu
      timeStr: '15:30 EST',
      status: 'scheduled',
    },
    {
      id: 'slot-7',
      brandKey: 'creatives',
      channel: 'Threads',
      topic: 'Spatial Typography & Architectural Layout',
      hook: 'Negative space is not empty. It is structural tension.',
      dayOfWeek: 4, // Fri
      timeStr: '13:00 EST',
      status: 'scheduled',
      hasPhoto: true,
    },
    {
      id: 'slot-8',
      brandKey: 'hilton_head',
      channel: 'LinkedIn',
      topic: 'Fiduciary Boardroom Horizon & Stewardship',
      hook: 'Boards that govern for quarterly accolades sacrifice generational durability.',
      dayOfWeek: 4, // Fri
      timeStr: '16:00 EST',
      status: 'scheduled',
    },
    {
      id: 'slot-9',
      brandKey: 'porch_md',
      channel: 'Instagram',
      topic: 'Premises Toxicity & Attic Air-Pathway Forensics',
      hook: 'What enters your attic air-pathway determines your indoor toxic burden.',
      dayOfWeek: 5, // Sat
      timeStr: '11:30 EST',
      status: 'scheduled',
      hasPhoto: true,
    },
  ]);

  // Merge any approved drafts from App props into the calendar
  const allSlots = [...slots];
  drafts
    .filter((d) => d.status === 'approved' || d.scheduled_at)
    .forEach((d, idx) => {
      if (!allSlots.some((s) => s.id === d.id)) {
        allSlots.push({
          id: d.id,
          brandKey: d.brand_key,
          channel: d.channel,
          topic: d.topic,
          hook: d.selected_hook || d.hook_options[0],
          magazineColumn: d.magazine_column,
          dayOfWeek: (idx + 1) % 7,
          timeStr: d.scheduled_at || '11:00 EST',
          status: 'approved',
          hasPhoto: Boolean(d.photo_url || d.image_card_data),
          hasVideo: Boolean(d.video_url),
        });
      }
    });

  // Filter slots
  const filteredSlots = allSlots.filter((slot) => {
    if (selectedBrand !== 'ALL' && slot.brandKey !== selectedBrand) return false;
    if (selectedChannel !== 'ALL' && slot.channel !== selectedChannel) return false;
    return true;
  });

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CalendarSlot = {
      id: `slot-${Date.now()}`,
      brandKey: newBrandKey,
      channel: newChannel,
      topic: newTopic,
      magazineColumn: newBrandKey === 'bes_outkast' ? newColumn : undefined,
      dayOfWeek: newDay,
      timeStr: `${newTime} EST`,
      status: 'scheduled',
      hasPhoto: true,
    };
    setSlots((prev) => [...prev, newEntry]);
    setIsAddModalOpen(false);
  };

  const handleMarkPublished = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'published' } : s))
    );
    if (selectedSlot && selectedSlot.id === id) {
      setSelectedSlot((prev) => (prev ? { ...prev, status: 'published' } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Editorial Publishing Schedule & Content Calendar
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                MULTI-BRAND DISPATCH GRID
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Synchronized cross-platform publishing matrix across all 7 sovereign brands and Bes Outkast Society magazine columns.
            </p>
          </div>

          {/* Quick Schedule Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Dispatch</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              Dispatches This Week
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white">{filteredSlots.length}</span>
              <span className="text-[11px] text-emerald-400 font-medium">100% on schedule</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              Bes Outkast Columns
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-amber-400">
                {filteredSlots.filter((s) => s.brandKey === 'bes_outkast').length}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">magazine dispatches</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              Media Attachment Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-400">
                {Math.round(
                  (filteredSlots.filter((s) => s.hasPhoto || s.hasVideo).length /
                    (filteredSlots.length || 1)) *
                    100
                )}
                %
              </span>
              <span className="text-[11px] text-neutral-400">vetted photo/video</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
              Peak Broadcast Window
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-neutral-200">10:00 - 14:00 EST</span>
              <span className="text-[10px] text-amber-400 font-mono">Max Reach</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-xl">
        {/* Week Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-neutral-950 border border-neutral-800 p-0.5">
            <button
              type="button"
              onClick={() => setWeekOffset((p) => p - 1)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded cursor-pointer transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
            >
              {weekOffset === 0 ? 'Current Week' : `Week ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`}
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((p) => p + 1)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded cursor-pointer transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {weekDates[0].monthName} {weekDates[0].dateNum} – {weekDates[6].monthName} {weekDates[6].dateNum}
          </span>
        </div>

        {/* Brand & Channel Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All 7 Brands</option>
              {Object.values(BRANDS).map((b) => (
                <option key={b.key} value={b.key}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Channel:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Channels</option>
              {Object.keys(CHANNEL_SPECS).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 7-Day Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDates.map((dayInfo, dayIdx) => {
          const daySlots = filteredSlots.filter((s) => s.dayOfWeek === dayIdx);
          return (
            <div
              key={dayIdx}
              className={`flex flex-col rounded-xl border bg-neutral-950/90 transition min-h-[480px] ${
                dayInfo.isToday
                  ? 'border-amber-400/80 shadow-lg shadow-amber-950/20 ring-1 ring-amber-400/40'
                  : 'border-neutral-850'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  dayInfo.isToday
                    ? 'bg-amber-400/10 border-amber-400/40'
                    : 'bg-neutral-900/60 border-neutral-850'
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      dayInfo.isToday ? 'text-amber-400' : 'text-neutral-300'
                    }`}
                  >
                    {dayInfo.dayName}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {dayInfo.monthName} {dayInfo.dateNum}
                  </span>
                </div>
                {dayInfo.isToday && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 font-black">
                    TODAY
                  </span>
                )}
              </div>

              {/* Day Slots List */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                {daySlots.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-neutral-600 space-y-1">
                    <span className="text-[10px] font-mono">No dispatches</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDay(dayIdx);
                        setIsAddModalOpen(true);
                      }}
                      className="text-[10px] text-amber-400/70 hover:text-amber-400 hover:underline cursor-pointer"
                    >
                      + Add slot
                    </button>
                  </div>
                ) : (
                  daySlots.map((slot) => {
                    const brand = BRANDS[slot.brandKey];
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer space-y-2 group relative ${
                          slot.status === 'published'
                            ? 'bg-neutral-900/40 border-neutral-800 opacity-70'
                            : 'bg-neutral-900 border-neutral-800 hover:border-amber-400/70 hover:shadow-md'
                        }`}
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: brand.palette.accent,
                        }}
                      >
                        {/* Time & Channel */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-neutral-400 font-semibold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            {slot.timeStr}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[9px]">
                            {slot.channel}
                          </span>
                        </div>

                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-1.5">
                          <BrandLogo brandKey={slot.brandKey} size="xs" />
                          <span className="text-[10px] font-bold text-white truncate max-w-[120px]">
                            {brand.name}
                          </span>
                        </div>

                        {/* Column Tag (Bes Outkast) */}
                        {slot.magazineColumn && (
                          <div className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 truncate">
                            {slot.magazineColumn}
                          </div>
                        )}

                        {/* Topic / Headline */}
                        <p className="text-[11px] text-neutral-200 line-clamp-2 font-medium leading-snug">
                          {slot.topic}
                        </p>

                        {/* Media Badges & Status */}
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-850/60 text-[9px] text-neutral-500 font-mono">
                          <div className="flex items-center gap-1">
                            {slot.hasPhoto && (
                              <span title="Photo Attached">
                                <Camera className="w-3 h-3 text-emerald-400" />
                              </span>
                            )}
                            {slot.hasVideo && (
                              <span title="B-Roll Video Attached">
                                <Film className="w-3 h-3 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <span
                            className={
                              slot.status === 'published'
                                ? 'text-emerald-400'
                                : 'text-neutral-400'
                            }
                          >
                            {slot.status === 'published' ? 'Dispatched' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal for Selected Slot */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BrandLogo brandKey={selectedSlot.brandKey} size="sm" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {BRANDS[selectedSlot.brandKey].name}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {selectedSlot.channel} • {selectedSlot.timeStr}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              {selectedSlot.magazineColumn && (
                <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono text-[11px]">
                  Magazine Column: <strong>{selectedSlot.magazineColumn}</strong>
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Topic & Thesis
                </span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedSlot.topic}</p>
              </div>

              {selectedSlot.hook && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                    Calibrated Hook
                  </span>
                  <p className="text-xs text-neutral-200 italic">&ldquo;{selectedSlot.hook}&rdquo;</p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                <span className="text-neutral-400">Dispatch Status:</span>
                <span className="font-mono font-bold text-amber-400 uppercase">
                  {selectedSlot.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToStudio) onNavigateToStudio(selectedSlot.brandKey);
                  setSelectedSlot(null);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Brand Studio
              </button>

              <div className="flex items-center gap-2">
                {selectedSlot.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => handleMarkPublished(selectedSlot.id)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Mark Dispatched
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSlot}
            className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Schedule New Dispatch Slot
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Target Brand:</label>
                <select
                  value={newBrandKey}
                  onChange={(e) => setNewBrandKey(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {Object.values(BRANDS).map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {newBrandKey === 'bes_outkast' && (
                <div>
                  <label className="text-amber-400 block mb-1">Magazine Column:</label>
                  <select
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {BRANDS.bes_outkast.columns?.map((col) => (
                      <option key={col.id} value={col.name}>
                        {col.name} ({col.assignedWorkers})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Channel:</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {Object.keys(CHANNEL_SPECS).map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Day of Week:</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {DAYS.map((d, i) => (
                      <option key={i} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">Time (EST):</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Dispatch Topic / Subject:</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter editorial thesis or topic..."
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="py-1.5 px-3.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Add to Calendar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
