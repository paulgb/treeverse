import Vis from './vis'

export default async function Page({
  params,
}: {
  params: Promise<{ user: string; post: string }>
}) {
  let { user, post } = await params
  user = decodeURIComponent(user)
  post = decodeURIComponent(post)

  return <Vis user={user} post={post} />
}
