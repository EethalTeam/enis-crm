import React from "react";
import ENISImg from "../../Assets/Images/ENIS_Logo1.png";

const Footer = () => {
  return (
    <footer
      className="
        fixed bottom-0 left-0
        w-full
        z-40

        glass-card
        bg-gradient-to-b from-[#1b0a2c] via-[#2a133b] to-[#3a1b4a]
        border-t border-purple-700/50

        text-slate-300 text-xs
        px-4 py-2

        flex
        justify-center md:justify-end
        items-center
      "
    >
      <span className="flex items-center gap-2 text-xs md:text-sm">
        © {new Date().getFullYear()} Arvat | Developed by
        <a
          href="https://eethalnaditsolutions.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300 font-semibold"
        >
          {/* <img
            src={ENISImg}
            alt="ENIS"
            className="w-5 h-5 md:w-6 md:h-6 object-contain"
          /> */}
          ENIS
        </a>
      </span>
    </footer>
  );
};

export default Footer;
