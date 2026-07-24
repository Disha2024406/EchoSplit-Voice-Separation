import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Waveform, SignIn, User, SignOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/technology", label: "Technology" },
  { to: "/docs", label: "Documentation" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 inset-x-0 z-50"
      data-testid="site-navbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3">
        <div className="glass flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <Waveform weight="duotone" size={26} className="text-cyan-500" />
            <span className="font-heading font-extrabold text-lg tracking-tight">EchoSplit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate("/dashboard")}
                  data-testid="nav-dashboard-btn"
                >
                  <User weight="duotone" size={18} className="mr-1" /> {user.name?.split(" ")[0]}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => { logout(); navigate("/"); }}
                  data-testid="nav-logout-btn"
                >
                  <SignOut size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hidden sm:inline-flex"
                  onClick={() => navigate("/login")}
                  data-testid="nav-login-btn"
                >
                  <SignIn size={16} className="mr-1" /> Login
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950"
                  onClick={() => navigate("/signup")}
                  data-testid="nav-signup-btn"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
