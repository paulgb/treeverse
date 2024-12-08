import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-xl space-y-4">
        <p className="text-lg font-bold flex items-center gap-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
          Treeverse needs a post ID to visualize!
        </p>

        <p>A valid URL for Treeverse has the form:</p>

        <p className="text-sm font-mono bg-gray-800 p-2">
          https://treeverse.app/profile/{'<user id>'}/post/{'<post id>'}
        </p>
      </div>
    </div>
  )
}
