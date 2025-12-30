import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingCallButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("call-logs")}
      title="Go to Call Logs"
      className="
        fixed bottom-6 right-6 z-[999]
        w-14 h-14
        rounded-full
        bg-gradient-to-r from-emerald-500 to-green-600
        text-white
        shadow-xl
         items-center justify-center
        hover:scale-110
        transition-transform   hidden md:flex 
      "
    >
      <Phone className="w-6 h-6" />
    </button>
  );
}
