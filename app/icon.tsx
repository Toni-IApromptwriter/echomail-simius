import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: "8px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 512 512"
          fill="none"
          stroke="#fafafa"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="256" cy="256" r="200" />
          <path d="M256 160v192M160 256h192" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
