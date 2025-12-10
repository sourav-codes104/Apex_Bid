import { Users } from "lucide-react";

interface ParticipantsCounterProps {
  count: number;
}

const ParticipantsCounter = ({ count }: ParticipantsCounterProps) => {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
      <Users className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">Participants</p>
        <p className="text-lg font-bold">{count}</p>
      </div>
    </div>
  );
};

export default ParticipantsCounter;
