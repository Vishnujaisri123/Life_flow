import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReminderSoundType } from "@/services/reminderApi";
import { playReminderSound } from "@/services/reminderSound";

const SOUNDS: { value: ReminderSoundType; label: string }[] = [
  { value: "chime", label: "Chime" },
  { value: "bell", label: "Bell" },
  { value: "soft", label: "Soft" },
  { value: "urgent", label: "Urgent" },
  { value: "silent", label: "Silent" },
];

type SoundPickerProps = {
  value: ReminderSoundType;
  onChange: (v: ReminderSoundType) => void;
  className?: string;
};

export function SoundPicker({ value, onChange, className }: SoundPickerProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v as ReminderSoundType);
        void playReminderSound(v as ReminderSoundType);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sound" />
      </SelectTrigger>
      <SelectContent>
        {SOUNDS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
