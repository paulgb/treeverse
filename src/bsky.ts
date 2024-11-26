export async function getPosts(user: string, post: string): Promise<AtProtoThreadResponse> {
  const atUri = `at://${user}/app.bsky.feed.post/${post}`
  const url = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread')
  url.searchParams.set('uri', atUri)
  url.searchParams.set('depth', '6')

  const res = await fetch(url)
  const json = await res.json()
  return json
}

export interface AtProtoThreadResponse {
  thread: AtProtoThread
}

/**
 * Represents atproto type: `app.bsky.feed.defs#threadViewPost`
 */
export interface AtProtoThread {
  post: AtProtoPost
  replies: AtProtoThread[]
}

export interface AtProtoPost {
  author: AtProtoAuthor
  record: AtProtoRecord
  likeCount: number
  quoteCount: number
  repostCount: number
  replyCount: number
  uri: string
}

export interface AtProtoAuthor {
  avatar: string
  did: string
  handle: string
  displayName: string
}

export interface AtProtoRecord {
  text: string
  createdAt: string
}
