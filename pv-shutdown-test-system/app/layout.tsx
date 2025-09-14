import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '光伏关断器实验数据管理系统',
  description: 'Photovoltaic Rapid Shutdown Device Testing Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} bg-dark-950 text-gray-100`}>
        {children}
      </body>
    </html>
  )
}