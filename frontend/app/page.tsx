'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AboutPanel from '@/components/AboutPanel'
import TextAnalyzePanel from '@/components/TextAnalyzePanel'
import AnalyzePanel from '@/components/AnalyzePanel'
import UrlAnalyzePanel from '@/components/UrlAnalyzePanel'

export default function Home() {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'about' && <AboutPanel />}
        {activeTab === 'text'  && <TextAnalyzePanel />}
        {activeTab === 'image' && <AnalyzePanel />}
        {/* {activeTab === 'url' && <UrlAnalyzePanel />} */}
      </main>
    </div>
  )
}
