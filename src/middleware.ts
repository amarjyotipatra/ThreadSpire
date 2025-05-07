import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// Define public routes using createRouteMatcher
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/threads/public",
  "/thread/:id",
  "/explore",
  "/sign-in(.*)", // Ensure sign-in page and its sub-paths are public
  "/sign-up(.*)", // Ensure sign-up page and its sub-paths are public
  "/api/public/(.*)" // Example for other public API routes
]);

export default clerkMiddleware(async (authInstance, req: NextRequest) => {
  try {
    console.log("[Middleware] Started for path:", req.nextUrl.pathname);

    // Get the userId by awaiting the authInstance function
    // authInstance is the function passed by clerkMiddleware, call it to get auth state
    const { userId } = await authInstance();
    console.log("[Middleware] userId:", userId);

    // If the request is for a public route, allow it
    if (isPublicRoute(req)) {
      console.log("[Middleware] Public route, allowing.");
      return NextResponse.next();
    }

    // If there's no userId, the user is not authenticated.
    // Redirect them to the sign-in page.
    if (!userId) {
      console.log("[Middleware] User not authenticated, redirecting to sign-in.");
      const currentPath = req.nextUrl.pathname;
      const signInUrl = new URL("/sign-in", req.url); // Construct URL relative to current request's origin

      // Parameter for Clerk to redirect after successful sign-in
      signInUrl.searchParams.set("redirect_url", currentPath);

      // Custom 'reason' parameter for the sign-in page
      if (currentPath.startsWith("/bookmarks")) {
        signInUrl.searchParams.set("reason", "bookmarks");
      } else if (currentPath.startsWith("/collections")) {
        signInUrl.searchParams.set("reason", "profile");
      }
      
      console.log("[Middleware] Redirecting to:", signInUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    // If the user is signed in and the route is not public, allow the request
    console.log("[Middleware] User authenticated, allowing access to protected route.");
    return NextResponse.next();

  } catch (error) {
    console.error("[Middleware] Error during invocation:", error);
    // Return a generic error response or rethrow if Vercel handles it better
    // For now, just log and let Vercel show its default error page for middleware failure
    // You might want to return NextResponse.error() or a custom error page if needed.
    throw error; // Rethrow to ensure Vercel logs it as a failure
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};