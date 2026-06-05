"use client";

interface UserInfo {
  userId: string;
  username?: string;
  displayName?: string;
  avatar?: string | null;
}

interface UserCellProps {
  user?: UserInfo;
  userId?: string;
}

export default function UserCell({ user, userId }: UserCellProps) {
  const id = user?.userId || userId || "???";
  const name = user?.displayName || user?.username || id;
  const avatar = user?.avatar;
  const isResolved = name !== id;

  return (
    <div className="flex items-center gap-2.5">
      {avatar ? (
        <img src={avatar} alt="" className="w-7 h-7 rounded-full ring-1 ring-dark-500" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-dark-500 flex items-center justify-center text-[10px] font-medium text-gray-400">
          {isResolved ? name[0]?.toUpperCase() : "?"}
        </div>
      )}
      <div className="min-w-0">
        {isResolved ? (
          <>
            <p className="text-xs font-medium text-white truncate">{name}</p>
            <p className="text-[10px] text-gray-500 font-mono">{id.substring(0, 12)}...</p>
          </>
        ) : (
          <p className="text-xs font-mono text-gray-300">{id}</p>
        )}
      </div>
    </div>
  );
}
