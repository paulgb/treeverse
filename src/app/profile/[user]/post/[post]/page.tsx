import Sidebar from './sidebar'
import Vis from './vis'

export default async function Page({
  params,
}: {
  params: Promise<{ user: string; post: string }>
}) {
  let { user, post } = await params
  user = decodeURIComponent(user)
  post = decodeURIComponent(post)

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 bg-red-500">
        <Vis user={user} post={post} />
      </div>
      <div className="w-64">
        <Sidebar />
      </div>
    </div>
  )
}
