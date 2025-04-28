import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { processCapsule } from "@/app/actions"

// This route would be called by a cron job service (like Vercel Cron Jobs)
// to process capsules that are due to be sent

export async function GET() {
  try {
    // Get all pending capsules that are due
    const now = new Date()
    const capsules = await db.capsules.findMany({
      orderBy: { scheduledDate: "asc" },
    })

    const dueCapsules = capsules.filter(
      (capsule) => capsule.status === "pending" && new Date(capsule.scheduledDate) <= now,
    )

    // Process each capsule
    const results = await Promise.allSettled(dueCapsules.map((capsule) => processCapsule(capsule.id)))

    // Count successes and failures
    const successes = results.filter(
      (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.success,
    ).length
    const failures = results.length - successes

    return NextResponse.json({
      success: true,
      processed: dueCapsules.length,
      successes,
      failures,
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
