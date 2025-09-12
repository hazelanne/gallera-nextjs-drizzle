import { Event, Fight } from "@/components/player/types";

interface EventFeedProps {
  currentEvent: Event | null;
  currentFight: Fight | null;
}

export default function EventFeed({
  currentEvent,
  currentFight,
}: EventFeedProps) {
  return (
    <section className="w-full rounded-xl shadow overflow-hidden border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
        <h3 className="font-semibold text-gray-800">{currentEvent?.name}</h3>
        {currentFight && (
          <span className="text-sm font-medium text-gray-600">
            Fight #{currentFight?.fightNumber}
          </span>
        )}
      </div>

      {/* Video area (placeholder for now) */}
      <div className="bg-black aspect-video flex items-center justify-center">
        {/* Replace this with your <video> or stream player */}
        <span className="text-white text-xs">[ Live Video Stream ]</span>
      </div>

      {/* Announcements */}
      <div className="overflow-hidden whitespace-nowrap bg-yellow-100 px-4 py-1">
        <div className="inline-block animate-marquee text-sm font-medium text-yellow-800">
          ⚡ Betting closes 10 seconds before the fight starts! &nbsp;&nbsp;📢
          Stay tuned for the next fight!
        </div>
      </div>
    </section>
  );
}
