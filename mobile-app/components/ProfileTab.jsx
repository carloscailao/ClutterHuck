"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "../lib/supabaseClient"

export default function ProfileTab({ userId }) {
  const [profile, setProfile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Load profile data
  useEffect(() => {
    const getProfile = async () => {
      let { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single()

      if (error) console.error(error)
      else setProfile(data)
    }

    if (userId) getProfile()
  }, [userId])

  // Handle image upload
  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]

      if (!file) return

      // unique filename
      const fileName = `${userId}-${Date.now()}-${file.name}`

      // Upload to "avatars" bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
      const publicUrl = data.publicUrl

      // Update user profile
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (dbError) throw dbError

      setProfile({ avatar_url: publicUrl })
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg w-64">
      <h2 className="font-bold mb-2">My Profile</h2>

      {/* Avatar Display */}
      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt="Profile Picture"
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-[100px] h-[100px] rounded-full bg-gray-200 flex items-center justify-center">
          No Image
        </div>
      )}

      {/* Upload Input */}
      <div className="mt-3">
        <label className="cursor-pointer text-sm text-blue-600">
          {uploading ? "Uploading..." : "Change Picture"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  )
}
