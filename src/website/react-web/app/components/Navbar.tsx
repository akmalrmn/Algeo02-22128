import React from "react";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full h-16 bg-black text-white px-8 flex justify-between items-center z-50">
      <h3 className="text-2xl font-bold text-[beige]">LOOGLE GENS</h3>
      <div className="flex gap-x-16 mr-6">
        <ScrollLink
          to="home"
          spy={true}
          smooth={true}
          offset={-70}
          duration={500}
          className="cursor-pointer hover:scale-125 hover:font-bold hover:text-[beige] transition-all"
        >
          Home
        </ScrollLink>
        <a className="cursor-pointer hover:scale-125 hover:font-bold hover:text-[beige] transition-all">
          Result
        </a>
        <a className="cursor-pointer hover:scale-125 hover:font-bold hover:text-[beige] transition-all">
          How To Use
        </a>
        <a className="cursor-pointer hover:scale-125 hover:font-bold hover:text-[beige] transition-all">
          About Us
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
