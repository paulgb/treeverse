'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEFAULT_URL = 'https://bsky.app/profile/paulbutler.org/post/3lbn5m3ddus2d'

function Input({
  placeholder,
  className,
  value,
  onChange,
  onSubmit,
}: {
  placeholder: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
}) {
  return (
    <input
      type="text"
      className={`bg-gray-800 p-2 rounded w-full placeholder:text-gray-500 border-gray-400 border-2 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSubmit?.()
        }
      }}
    />
  )
}

function Button({
  children,
  disabled,
  className,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      className={`bg-blue-500 disabled:bg-gray-400 hover:bg-blue-600 text-white p-2 rounded ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function extractPartsFromProfile(value: string): { profile: string; post: string } | null {
  const rx = /^(https?:\/\/)?(bsky\.app|bsky\.social)\/profile\/([^\/]+)\/post\/([^\/]+)$/
  const match = value.match(rx)
  if (!match) {
    return null
  }
  return { profile: match[3], post: match[4] }
}

function extractPartsFromAtUrl(value: string): { profile: string; post: string } | null {
  const rx = /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/
  const match = value.match(rx)
  if (!match) {
    return null
  }
  return { profile: match[1], post: match[2] }
}

function extractPartsFromUrl(value: string): { profile: string; post: string } | null {
  value = value.trim()
  return extractPartsFromProfile(value) || extractPartsFromAtUrl(value)
}

export default function Urlbar() {
  const router = useRouter()
  const [url, setUrl] = useState(DEFAULT_URL)
  const parts = extractPartsFromUrl(url)

  const handleGo = () => {
    router.push(`/profile/${parts?.profile}/post/${parts?.post}`)
  }

  return (
    <div className="flex flex-row gap-2">
      <Input
        placeholder={DEFAULT_URL}
        value={url}
        onChange={(value) => setUrl(value)}
        onSubmit={handleGo}
      />
      <Button className="w-20" disabled={!parts} onClick={handleGo}>
        Go
      </Button>
    </div>
  )
}
