"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  History,
  Bot,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true },
    { href: "/practice", label: "Luyện tập", icon: BookOpen, authRequired: true },
    { href: "/exams", label: "Thi thử", icon: FileCheck2, authRequired: true },
    { href: "/history", label: "Lịch sử", icon: History, authRequired: true },
    { href: "/tutor", label: "Gia sư AI", icon: Bot, authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Math THPT <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">AI Tutor</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Ôn thi THPT Quốc Gia</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive("/admin")
                        ? "bg-purple-100 text-purple-800"
                        : "text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Quản trị</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Giới thiệu
              </Link>
            )}
          </nav>

          {/* User Section / Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">{user.name}</p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {user.role === "ADMIN" ? "Quản trị viên" : "Học sinh 12"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Đăng xuất"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <div className="py-2 px-3 mb-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  {user.role}
                </span>
              </div>

              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(item.href) ? "bg-blue-50 text-blue-700" : "text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Quản trị hệ thống</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
