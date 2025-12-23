import { clerkMiddleware , createRouteMatcher} from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
"/signin",
"/signup",
"/",
"/home"
])

const isPublicApiRoute = createRouteMatcher([
  "/api/videos"

]);

export default clerkMiddleware(async (auth,req)=>{
const {userId} = await auth() // undefined if not signed in
const currentUrl = new URL(req.url)
const isAccessingDashboard = currentUrl.pathname === "/home"
const isApiRequest = currentUrl.pathname.startsWith("/api/")

// The user is signed in and is trying to access a public route but not the dashboard
if(userId && isPublicRoute(req) && !isAccessingDashboard) {
return NextResponse.redirect(new URL("/home", req.url))

}
// not logged in 
if(!userId) {
// if user is not logged in and trying to access a protected route
if(!isPublicRoute(req) && !isPublicApiRoute(req)){
return NextResponse.redirect(new URL("/signin", req.url))
}

// if user is not logged in and trying to access a protected api route
if(isApiRequest && !isPublicApiRoute(req)){
return NextResponse.redirect(new URL("/signin", req.url))
}

}
return NextResponse.next()

})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};