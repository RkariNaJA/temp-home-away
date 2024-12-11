"use server";
//**IMP**

import {
  createReviewSchema,
  imageSchema,
  profileSchema,
  propertySchema,
  validateWithZodSchema,
} from "./schemas";
import db from "./db";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import exp from "constants";
import { uploadImage } from "./supabase";

//Give all user info
const getAuthUser = async () => {
  // currentUser() would internally call Clerk's backend to fetch the current authenticated user
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to access this route");
  }
  if (!user.privateMetadata.hasProfile) {
    redirect("/prifile/create");
  }
  return user;
};

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    //Check if error is an instance of the Error
    message: error instanceof Error ? error.message : "An error occured",
  };
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    //From Clerk
    const user = await currentUser();
    if (!user) {
      throw new Error("Please login to create a profile");
    }
    //From Clerk
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? "",
        ...validatedFields,
      },
    });
    //From Clerk
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProfileImage = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });
  return profile?.profileImage;
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) {
    redirect("/prifile/create");
  }
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    //Update Database
    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });

    revalidatePath("/profile");
    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image); // URL

    //Update our profile in the Prisma
    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/");
    return { message: "Profile image updated successfully" }; //Toast message
  } catch (error) {
    return renderError(error);
  }
};

export const createPropertyAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser(); //Grab user
  try {
    const rawData = Object.fromEntries(formData); //All values will be located
    const file = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(propertySchema, rawData); //Validate data
    const validatedFile = validateWithZodSchema(imageSchema, { image: file }); //Validate image
    const fullPath = await uploadImage(validatedFile.image); //leads to Super base bucket

    await db.property.create({
      data: {
        ...validatedFields,
        image: fullPath,
        profileId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

//Display info on the card on home page
export const fetchProperties = async ({
  search = "",
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    //if the category is undefind will get all of the propertyy
    where: {
      category,
      // OR for the search terms
      //List the properties which we want to use for our search
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      tagline: true,
      country: true,
      price: true,
      image: true,
    },
    //The newest properties will be display first in the list
    orderBy: {
      createdAt: "desc",
    },
  });
  return properties;
};

//To check if the ID exists that means that
//the property is one of the user favorites
export const fetchFavoriteId = async ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    //if we get back the id that means that propeerty is one of the favorites
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  //Access to the user data
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  // console.log(propertyId, favoriteId, pathname);

  try {
    // if favoriteId exists, it means that the property is already added to the favorite so then we remove it
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
      // else then add the property to the favorites
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? "Removed form Faves" : "Added to Faves" };
  } catch (error) {
    return renderError(error);
  }
};

//Display Favorites card on Favorites page
export const fetchFavorites = async () => {
  //Access to the user data
  const user = await getAuthUser();
  //Get the info from database
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          price: true,
          country: true,
          image: true,
        },
      },
    },
  });
  return favorites.map((favorite) => favorite.property);
};

//fetch the property details
//Display property details base on property ID
export const fetchPropertyDetails = async (id: string) => {
  //Combine property and profile database
  return db.property.findUnique({
    where: {
      id,
    },
    //Include = get all of the properties of the profile
    include: {
      profile: true,
      bookings: {
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
    },
  });
};

export const createReviewAction = async (
  prevState: any,
  formData: FormData //represent key-value pairs of form fields and their values
) => {
  //Get user info
  const user = await getAuthUser();
  try {
    // Converts FormData to a plain JavaScript object
    // In formData should have name="propertyId" : name="rating" :  name="comment" from the SubmitReview.tsx
    const rawData = Object.fromEntries(formData);

    //Validate the rawData against the createReviewSchema
    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);

    await db.review.create({
      data: {
        ...validatedFields,
        profileId: user.id,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

// Add Reviews to the list after the user submit the review
export async function fetchPropertyReviews(propertyId: string) {
  //Get reviews base on the propertyID
  const reviews = await db.review.findMany({
    // Only get the reviews PropertyId in db matches to the propertyId
    where: {
      propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
}

//Fetch based on the user ID
export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  //Get the reviews base on user id
  const reviews = await db.review.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
};

//Delete review base on the user id and review id
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        profileId: user.id,
      },
    });
    //To see the latest changes
    revalidatePath("/reviews");
    return { message: "Review deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//Get the raiting for specific property
export async function fetchPropertyRating(propertyId: string) {
  //groupBy : use to group the reviews based on the propertyId for a snigle property
  //Prisma will return an array with just one object that contains average rating and count data
  // groupBy, _avg, and _count methods are features from Prisma
  const result = await db.review.groupBy({
    by: ["propertyId"],
    //Calculates the average rating for the reviews of the property
    _avg: {
      rating: true,
    },
    //Counts the number of ratings (reviews) for the property
    _count: {
      rating: true,
    },
    //Filters the reviews to only retrieve reviews for the specific property passed into the function
    where: {
      propertyId,
    },
  });

  // empty array if no reviews
  return {
    //Average rating of the property
    //result[0]?._avg.rating: Accesses the average rating from the first (and usually only) result in the result array.
    //.toFixed(1): Formats the average rating to one decimal place.
    // ?? 0: If the average rating is null or undefined, it defaults to 0.
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    //The total number of reviews for the property
    //result[0]?._count.rating: Accesses the count of ratings from the first (and usually only) result in the result array.
    //?? 0: If the count is null or undefined, it defaults to 0.
    count: result[0]?._count.rating ?? 0,
  };
}

//To check whether the user has already left the review
export const findExistingReview = async (
  userId: string,
  propertyId: string
) => {
  return db.review.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
};
