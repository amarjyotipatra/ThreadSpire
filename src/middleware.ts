import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes using createRouteMatcher
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/threads/public",
  "/thread/:id",
  "/explore",
]);

export default clerkMiddleware((auth, req) => {
  // If the request is for a public route, allow it
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // If the user is not signed in, handle redirects with custom parameters
  if (!auth) {
    const path = new URL(req.url).pathname;
    
    // Custom redirect for bookmarks
    if (path.startsWith("/bookmarks")) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", path);
      signInUrl.searchParams.set("reason", "bookmarks");
      return NextResponse.redirect(signInUrl);
    }
    
    // Custom redirect for collections/profile
    if (path.startsWith("/collections")) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", path);
      signInUrl.searchParams.set("reason", "profile");
      return NextResponse.redirect(signInUrl);
    }
    
    // Default sign-in redirect
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If the user is signed in, allow the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};