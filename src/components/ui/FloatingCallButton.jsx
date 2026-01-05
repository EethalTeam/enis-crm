import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingCallButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("dialer")}
      title="Go to Dialer"
      className="
        fixed
        bottom-20
        right-2
        
 z-[999] 
        md:w-14 md:h-14
        w-11 h-11
        rounded-full
        bg-gradient-to-r from-emerald-500 to-green-600
        text-white
        shadow-xl
         items-center justify-center
        hover:scale-110
        transition-transform  flex 
      "
    >
      <Phone className="w-6 h-6" />
    </button>
  );
}
