"use server";
//**IMP**

import {
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
    },
  });
};
