"use client"

import LightPillar from "@/components/LightPillar"
import { useTheme } from "@/components/ThemeProvider"

export default function ThemedBackground() {
  const { theme } = useTheme()
  const dark = theme === "dark"

  return (
    <>
      {/* Solid base color — transitions smoothly */}
      <div
        className="fixed inset-0 -z-20 transition-colors duration-700"
        style={{ background: dark ? "#000000" : "#f0f4ff" }}
      />
      {/* LightPillar on top — colors shift with theme */}
      <div className="fixed inset-0 -z-10">
        <LightPillar
          topColor={dark ? "#0033ff" : "#4488ff"}
          bottomColor={dark ? "#6600ff" : "#aa55ff"}
          intensity={dark ? 1.0 : 0.55}
          glowAmount={dark ? 0.002 : 0.0015}
          bloom={dark ? 0.5 : 0.35}
          pillarWidth={3}
          pillarHeight={0.4}
          pillarRotation={25}
          rotationSpeed={0.2}
          interactive={true}
          clickPulse={true}
          intro={false}
          quality="high"
          mixBlendMode={dark ? "screen" : "multiply"}
          noiseIntensity={0.3}
          fade={0}
        />
      </div>
    </>
  )
}
