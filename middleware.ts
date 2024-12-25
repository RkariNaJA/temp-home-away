import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

///properties(.*) = everything after /properties
const isPublicRoute = createRouteMatcher(["/", "/properties(.*)"]);
//Admin route
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // console.log(auth().userId);

  //Checking whether the currently authenticated user is an admin by comparing the user's ID  with an admin ID stored in variables
  //auth().userId: This accesses the userId of the currently authenticated user
  const isAdminUser = auth().userId === process.env.ADMIN_USER_ID;
  //If user are on the admin route
  if (isAdminRoute(req) && !isAdminUser) {
    //navigate user to the home page
    return NextResponse.redirect(new URL("/", req.url));
  }
  // If the route is not public one then user need to login or register in order to access the route
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
