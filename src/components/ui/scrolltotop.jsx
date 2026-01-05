
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop({ containerRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const handleScroll = () => {
      setVisible(el.scrollTop > 200);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  const scrollToTop = () => {
    containerRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-10 right-2 z-50
        w-10 h-10 rounded-full
        flex items-center justify-center
        
        text-white shadow-lg
        md:hidden
      "
    >
      <ChevronUp size={20} />
    </button>
  );
}

