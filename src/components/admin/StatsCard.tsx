import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "primary" | "accent" | "red";
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    red: "bg-red-100 text-red-600"
  };

  return (
    <div className="card-3d p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
      <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-xl md:text-3xl font-bold text-dark break-words">{value}</p>
    </div>
  );
}
