import { useState, useEffect } from "react";
import { HeartIcon } from "lucide-react";

type LoveProfile = {
    id: string;
    user_name: string;
    user_image: string | null;
    user_prompt: string | null;
    style: string;
    summary: string;
    architect_name: string | null;
    architect_image: string | null;
    created_at: string;
};

function UserInitials({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center border-3 border-white shadow">
            <span className="text-[#E34234] font-bold text-lg">{initials}</span>
        </div>
    );
}

function MatchPair({ profile }: { profile: LoveProfile }) {
    return (
        <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-pink-200"
            style={{ background: "linear-gradient(135deg, #E34234 0%, #E85D50 30%, #F2A0A0 60%, #FBD5D5 100%)" }}>

            {/* Header */}
            <div className="text-center pt-4 pb-2">
                <div className="flex items-center justify-center gap-1">
                    <HeartIcon className="size-3 text-white fill-white" />
                    <HeartIcon className="size-4 text-white fill-white" />
                    <HeartIcon className="size-3 text-white fill-white" />
                </div>
                <p className="text-white font-bold text-sm mt-1 drop-shadow">It's a Match!</p>
            </div>

            {/* Two photos side by side with heart between */}
            <div className="flex items-center justify-center gap-3 pb-3 px-4">
                {/* User */}
                <div className="flex flex-col items-center">
                    {profile.user_image ? (
                        <img
                            src={profile.user_image}
                            alt={profile.user_name}
                            className="w-16 h-16 object-cover rounded-full border-3 border-white shadow"
                        />
                    ) : (
                        <UserInitials name={profile.user_name} />
                    )}
                </div>

                <HeartIcon className="size-6 text-white fill-white flex-shrink-0" />

                {/* Architect */}
                <div className="flex flex-col items-center">
                    {profile.architect_image ? (
                        <img
                            src={profile.architect_image}
                            alt={profile.architect_name || ""}
                            className="w-16 h-16 object-cover rounded-full border-3 border-white shadow"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-white/30 border-3 border-white flex items-center justify-center shadow">
                            <HeartIcon className="size-6 text-white fill-white" />
                        </div>
                    )}
                </div>
            </div>

            {/* White card with details */}
            <div className="bg-white mx-3 mb-3 rounded-xl px-4 py-4 text-center">
                {/* Names */}
                <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="font-semibold text-pink-600">{profile.user_name}</span>
                    <HeartIcon className="size-3 text-[#E34234] fill-[#E34234]" />
                    <span className="font-semibold text-[#E34234]">{profile.architect_name || "?"}</span>
                </div>

                {/* Style badge */}
                <div className="mt-2">
                    <span className="inline-block text-xs font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                        {profile.style}
                    </span>
                </div>

                {/* Heart divider */}
                <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-pink-200" />
                    <HeartIcon className="size-3 text-pink-300 fill-pink-300" />
                    <div className="flex-1 h-px bg-pink-200" />
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-600 leading-relaxed">
                    {profile.summary}
                </p>

                {/* What they said */}
                {profile.user_prompt && (
                    <p className="text-xs italic text-pink-400 mt-2">
                        "{profile.user_prompt.slice(0, 80)}{profile.user_prompt.length > 80 ? "..." : ""}"
                    </p>
                )}
            </div>
        </div>
    );
}

export function WallOfLove() {
    const [profiles, setProfiles] = useState<LoveProfile[]>([]);

    const fetchProfiles = async () => {
        const res = await fetch("/api/wall");
        if (res.ok) {
            setProfiles(await res.json());
        }
    };

    useEffect(() => {
        fetchProfiles();
        const interval = setInterval(fetchProfiles, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen p-6"
            style={{ background: "linear-gradient(180deg, #FDF3F2 0%, #FFFFFF 100%)" }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <HeartIcon className="size-6 text-[#E34234] fill-[#E34234]" />
                        <h1 className="text-3xl font-bold text-[#E34234]">
                            Wall of Love
                        </h1>
                        <HeartIcon className="size-6 text-[#E34234] fill-[#E34234]" />
                    </div>
                    <p className="text-pink-400 font-medium">
                        Architecture love stories from our visitors
                    </p>
                </div>

                {profiles.length === 0 ? (
                    <div className="text-center py-12">
                        <HeartIcon className="size-12 text-pink-200 fill-pink-200 mx-auto mb-4" />
                        <p className="text-pink-300 text-lg">
                            No love profiles yet. Chat with Archi-Cupid to find yours!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {profiles.map((profile) => (
                            <MatchPair key={profile.id} profile={profile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
