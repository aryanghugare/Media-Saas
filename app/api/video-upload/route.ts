import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number
    [key: string]: any
}


export async function POST(request: NextRequest) {
const { userId } = await auth();
if (!userId) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
}

try {
if(!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
    return NextResponse.json({ error: 'Cloudinary configuration missing' }, { status: 500 });
}
const formData = await request.formData();
const file = formData.get('file') as File | null;
const title = formData.get('title') as string ;
const description = formData.get('description') as string ;
const originalSize = formData.get('originalSize') as string ; // we will get this from frontend while uploading

if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
}
// Important steps before uploading to Cloudinary
const bytes =  await file.arrayBuffer()
const buffer = Buffer.from(bytes);

const result = await new Promise<CloudinaryUploadResult>((resolve,reject)=>{
const uploadStream =  cloudinary.uploader.upload_stream(
{folder : 'video-uploads',
resource_type : 'video',
transformation :[{quality : 'auto',fetchformat : 'mp4'}] // to ensure video is in mp4 format
},
(error,result)=>{
if(error) reject(error);
else resolve(result as CloudinaryUploadResult);
}
)
uploadStream.end(buffer);
})

 const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
               duration : String(result.duration) || "", // little wrong 
            }
        })


    
} catch (error: any) {
    console.error('Cloudinary upload video error:', error);
    return NextResponse.json({ error: 'Error uploading video' }, { status: 500 });

} finally {
    await prisma.$disconnect()
}
}