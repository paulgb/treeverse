import { AtProtoPost } from '@/bsky'
import { LayoutNode } from '@/post'
import { useEffect, useRef } from 'react'

function urlFromPost(post: AtProtoPost): string | null {
  const match = post.uri.match(/^at:\/\/([^\/]+)\/app\.bsky\.feed\.post\/([a-z0-9]+)$/)
  if (!match) {
    return null
  }

  const [_, did, postId] = match
  return `https://bsky.app/profile/${did}/post/${postId}`
}

function Post({ post }: { post: AtProtoPost }) {
  return (
    <a
      href={urlFromPost(post) ?? '#'}
      target="_blank"
      className="block p-2 border border-gray-700 rounded-md space-y-4 hover:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <img src={post.author.avatar} className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-base font-bold text-gray-300">{post.author.displayName}</div>
          <div className="text-sm text-gray-500">@{post.author.handle}</div>
        </div>
      </div>
      <div className="text-sm text-gray-200">{post.record.text}</div>
    </a>
  )
}

function collectThread(node: LayoutNode | null): AtProtoPost[] {
  let thread: AtProtoPost[] = []
  while (node) {
    thread.push(node.post.post)
    node = node.parent
  }
  return thread.reverse()
}

export default function Sidebar({ selected }: { selected: LayoutNode | null }) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sidebarRef.current) {
      // scroll to the bottom
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [selected])

  if (!selected) {
    return null
  }

  const thread = collectThread(selected)

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full" ref={sidebarRef}>
      <div className="p-4 border border-gray-700 rounded-md bg-gray-800">
        <p className="text-sm text-gray-300 mb-2">
          <strong>Treeverse</strong> is a tool for visualizing threaded{' '}
          <a href="https://bsky.app/" className="text-blue-300 hover:text-blue-400">
            Bluesky
          </a>{' '}
          conversations.
        </p>
        <p className="text-sm text-gray-500">
          Created by{' '}
          <a
            href="https://bsky.app/profile/paulbutler.org"
            className="text-blue-300 hover:text-blue-400"
            target="_blank"
          >
            Paul Butler
          </a>
          . Source code available on{' '}
          <a
            href="https://github.com/paulgb/treeverse"
            className="text-blue-300 hover:text-blue-400"
            target="_blank"
          >
            GitHub
          </a>
          . Visualize a{' '}
          <a className="text-blue-300 hover:text-blue-400" href="/">
            different post
          </a>
          .
        </p>
      </div>
      {thread.map((post, i) => (
        <Post post={post} key={i} />
      ))}
    </div>
  )
}
