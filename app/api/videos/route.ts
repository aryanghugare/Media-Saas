import {NextRequest , NextResponse} from "next/server";
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })


export async function GET(request: NextRequest) {
try {
const videos = await prisma.video.findMany({
orderBy : {
createdAt : 'desc'
}
})


console.log("Videos fetched successfully", videos)


 return NextResponse.json(videos)
} catch (error : any) {
    return NextResponse.json({ error: "Error while fetching videos" }, { status: 500 })
}finally {
    await prisma.$disconnect()
}
}
