'use client'

import { useState } from 'react'
import { Shield, ChevronLeft, ChevronRight, ScanSearch, Type, Info, Link } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'about',  label: 'About',        icon: <Info size={17} /> },
  { id: 'text',   label: 'Text Analysis', icon: <Type size={17} /> },
  { id: 'image',  label: 'Image Analysis', icon: <ScanSearch size={17} /> },
  // { id: 'url', label: 'URL Analysis', icon: <Link size={17} /> }, // hidden for now
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col bg-[#111111] border-r border-[#222222] transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[#222222] px-4 py-5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <Shield className="text-red-700 shrink-0" size={18} />
            <span className="font-semibold text-[#d4d4d4] text-sm tracking-wide">
              MaliciousCheck
            </span>
          </div>
        )}
        {collapsed && <Shield className="text-red-700" size={18} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-[#555] hover:text-[#aaa] transition-colors ${collapsed ? 'mt-3' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 pt-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={collapsed ? tab.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-red-900/30 text-red-400 border border-red-900/50'
                : 'text-[#777] hover:text-[#ccc] hover:bg-white/[0.04] border border-transparent'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="shrink-0">{tab.icon}</span>
            {!collapsed && <span>{tab.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-[#222222]">
          <p className="text-[11px] text-[#444]">AI-powered scam detection</p>
        </div>
      )}
    </aside>
  )
}
