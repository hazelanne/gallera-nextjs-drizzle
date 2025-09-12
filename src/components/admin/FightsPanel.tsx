"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import {
  PlayCircle,
  Flag,
  XCircle,
  DoorOpen,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Fight, Team } from "@/components/admin/types";
import FightList from "@/components/admin/FightList";
import FightWinnerSelect from "@/components/admin/FightWinnerSelect";
import { cn } from "@/lib/utils";

type Action = "open" | "start" | "cancel" | "end";

export default function FightsPanel({
  eventId,
  teams,
}: {
  eventId: number;
  teams: Team[];
}) {
  const [loading, setLoading] = useState(false);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [showOpenFightModal, setShowOpenFightModal] = useState(false);
  const [showCancelFightModal, setShowCancelFightModal] = useState(false);
  const [fights, setFights] = useState<Fight[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentFight, setCurrentFight] = useState<Fight | null>(null);

  useEffect(() => {
    async function fetchFights() {
      try {
        const res = await fetch(
          `/api/fights?eventId=${eventId}&page=${page}&limit=10`
        );
        if (!res.ok) throw new Error("Failed to load fights");
        const data = await res.json();

        if (data.fights.length > 0) {
          setCurrentFight(data.fights[0]);
          setFights(data.fights);
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "No fights loaded",
          description: "Start fights using the control panel below.",
          variant: "destructive",
        });
      }
    }

    fetchFights();
  }, [page]);

  async function handleAction(action: Action, body?: any) {
    if (!currentFight && action !== "open") {
      toast({
        title: "No active fight",
        description: "Open fight using the control panel below.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let apiPath;
      if (action === "open") {
        apiPath = `/api/fights/`;
      } else {
        apiPath = `/api/fights/${currentFight?.id}/${action}`;
      }

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const currentFightData = await res.json();
      setCurrentFight(currentFightData);
      toast({
        title: `${action.toUpperCase()} OK`,
        variant: "default",
      });

      if (action === "open") {
        setFights((prev) => {
          if (page == 0) {
            return [...fights, currentFightData];
          }
          return prev;
        });
      } else {
        setFights((prev) => {
          const otherFights = prev.filter((f) => f.id !== currentFightData.id);
          return [...otherFights, currentFightData];
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: `${action.toUpperCase()} Failed`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenFight(aSideId: number, bSideId: number) {
    const body = {
      eventId: eventId,
      aSideId: aSideId,
      bSideId: bSideId,
    };

    handleAction("open", body);
  }

  function handleCancel() {
    if (confirm("Are you sure you want to cancel this fight?")) {
      handleAction("cancel");
    }
  }

  function handleResult(winner: string) {
    handleAction("end", { result: winner });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden rounded-xl shadow">
        {fights.length ? (
          <FightList
            fights={fights}
            teams={teams}
            page={page}
            hasMore={hasMore}
            onPageChange={setPage}
          />
        ) : (
          <div className="p-4 flex">
            <p className="text-gray-500 text-sm">
              Click the Open button (orange) to open a fight up for betting.
            </p>
          </div>
        )}

        {/* Action buttons below fight table */}
        <div className="p-4 space-y-4">
          <div className="flex gap-4 justify-center justify-start">
            <button
              onClick={() => setShowOpenFightModal(true)}
              disabled={
                loading ||
                (currentFight !== null &&
                  (currentFight.status === "started" ||
                    currentFight.status === "open"))
              }
              className="flex flex-col items-center justify-center p-2 bg-yellow-600 text-white rounded-2xl shadow hover:bg-yellow-700 disabled:opacity-50 w-24"
            >
              <DoorOpen size={20} />
              <span className="mt-1 hidden sm:block">Open</span>
            </button>

            <button
              onClick={() => handleAction("start")}
              disabled={
                loading ||
                !currentFight ||
                (currentFight.status !== "open" &&
                  currentFight.status !== "started") ||
                currentFight.status === "started"
              }
              className="flex flex-col items-center justify-center p-2 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 disabled:opacity-50 w-24"
            >
              <PlayCircle size={20} />
              <span className="mt-1 text-xs hidden sm:block">Start</span>
            </button>

            <button
              onClick={() => setShowDeclareModal(true)}
              disabled={
                loading || !currentFight || currentFight.status !== "started"
              }
              className="flex flex-col items-center justify-center p-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50 w-24"
            >
              <Flag size={20} />
              <span className="mt-1 text-xs hidden sm:block">Declare</span>
            </button>

            <button
              onClick={() => setShowCancelFightModal(true)}
              disabled={
                loading ||
                !currentFight ||
                currentFight.status === "closed" ||
                currentFight.status === "cancelled"
              }
              className="flex flex-col items-center justify-center p-2 bg-gray-600 text-white rounded-2xl shadow hover:bg-gray-700 disabled:opacity-50 w-24"
            >
              <XCircle size={20} />
              <span className="mt-1 text-xs hidden sm:block">Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Open Fight modal */}
      <OpenFightDialog
        isOpen={showOpenFightModal}
        onOpenChange={setShowOpenFightModal}
        teams={teams}
        onOpenFight={(aSideId, bSideId) => handleOpenFight(aSideId, bSideId)}
      />

      {/* Declare Fight Winner modal */}
      <FightWinnerSelect
        isOpen={showDeclareModal}
        onClose={() => setShowDeclareModal(false)}
        onResult={(winner) => handleResult(winner)}
      />

      {/* Cancel Fight modal */}
      <CancelFightDialog
        isOpen={showCancelFightModal}
        onOpenChange={setShowCancelFightModal}
        onConfirmCancel={() => handleAction("cancel")}
      />
    </div>
  );
}

interface OpenFightDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onOpenFight: (aSideId: number, bSideId: number) => void;
}

function OpenFightDialog({
  isOpen,
  onOpenChange,
  teams,
  onOpenFight,
}: OpenFightDialogProps) {
  const [openA, setOpenA] = useState<boolean>(false);
  const [openB, setOpenB] = useState<boolean>(false);
  const [aSide, setASide] = useState<String>("");
  const [bSide, setBSide] = useState<String>("");
  const [aSideId, setASideId] = useState<number | null>(null);
  const [bSideId, setBSideId] = useState<number | null>(null);

  // Filter teams based on input
  const filteredTeamsA = useMemo(
    () =>
      teams.filter((team) =>
        team.name.toLowerCase().includes(aSide.toLowerCase())
      ),
    [aSide, teams]
  );

  const filteredTeamsB = useMemo(
    () =>
      teams.filter((team) =>
        team.name.toLowerCase().includes(bSide.toLowerCase())
      ),
    [bSide, teams]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open New Fight</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Side A */}
          <div>
            <label className="block text-sm font-medium mb-1 text-red-600">
              LIYAMADO
            </label>
            <Popover open={openA} onOpenChange={setOpenA}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {aSide || "(Select)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search team..." />
                  <CommandList>
                    <CommandEmpty>No teams found.</CommandEmpty>
                    {teams.map((team) => (
                      <CommandItem
                        key={team.id}
                        disabled={team.name === bSide}
                        value={team.name.toString()}
                        onSelect={(val) => {
                          setASide(val);
                          setASideId(team.id);
                          setOpenA(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            aSide === team.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {team.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Side B */}
          <div>
            <label className="block text-sm font-medium mb-1 text-blue-600">
              DEHADO
            </label>
            <Popover open={openB} onOpenChange={setOpenB}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {bSide || "(Select)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search team..." />
                  <CommandList>
                    <CommandEmpty>No teams found.</CommandEmpty>
                    {teams.map((team) => (
                      <CommandItem
                        key={team.id}
                        value={team.name.toString()}
                        disabled={team.name === aSide}
                        onSelect={(val) => {
                          setBSide(val);
                          setBSideId(team.id);
                          setOpenB(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            bSide === team.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {team.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            disabled={!aSide || !bSide}
            onClick={() => {
              onOpenFight(aSideId!, bSideId!);
              setASide("");
              setBSide("");
              onOpenChange(false);
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            Open Fight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelFightDialog({
  isOpen,
  onOpenChange,
  onConfirmCancel,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel fight?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Cancelling this fight will void all bets. This action cannot be
          undone.
        </p>

        <DialogFooter className="flex justify-end gap-3 [&>button]:w-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-gray-400 text-white"
            onClick={() => {
              onConfirmCancel();
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
