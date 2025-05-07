import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Define public routes using createRouteMatcher
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/threads/public",
  "/thread/:id",
  "/explore",
  "/sign-in(.*)", // Ensure sign-in page is public
  "/sign-up(.*)", // Ensure sign-up page is public
  "/api/public/(.*)" // Example if you have other public API routes
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Get the authentication object by awaiting the auth function
  const { userId, redirectToSignIn } = await auth();

  // If the request is for a public route, allow it
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If there's no userId, the user is not authenticated.
  // Redirect them to the sign-in page.
  if (!userId) {
    const currentPath = new URL(req.url).pathname;
    const signInUrl = new URL("/sign-in", req.url);

    // Pass the original path to redirect back after sign-in
    signInUrl.searchParams.set("redirect_url", currentPath);

    // Add custom reason if applicable (matches your existing logic)
    if (currentPath.startsWith("/bookmarks")) {
      signInUrl.searchParams.set("reason", "bookmarks");
    } else if (currentPath.startsWith("/collections")) {
      signInUrl.searchParams.set("reason", "profile");
    }
    
    // Use the redirectToSignIn method from the awaited auth object
    return redirectToSignIn({ returnBackUrl: signInUrl.toString() });
  }

  // If the user is signed in and the route is not public, allow the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};