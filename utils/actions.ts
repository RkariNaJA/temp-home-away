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
import { calculateTotals } from "./calculateTotals";
import { formatDate } from "./format";

//Get all user info from clerk
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
//Check if auth user id match the admin id
const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }
  return user;
};

//Custom renderError function
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
    const fullPath = await uploadImage(validatedFields.image); // Upload to supabase

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
    //converts the FormData object into a plain JavaScript object, making it easier to work with
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    //Custom function that validates rawData using propertySchema
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

//Create booking in database and redirect user to bookings page
// receiving the whole object as prevState
export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  //Remove any booking where the payment status is set equal to false
  await db.booking.deleteMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
    },
  });
  // create variable
  let bookingId: null | string = null;
  const { propertyId, checkIn, checkOut } = prevState;

  //Fetching the price from database
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { price: true },
  });
  if (!property) {
    return { message: "Property not found" };
  }
  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price,
  });

  try {
    //Create booking modal in database
    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal,
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });
    // change value
    bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }
  //redirect to checkout where the stripe(payment) logic is
  //pass along the bookingId for filp the value to true in the booking prisma database; paymentStatus Boolean @default(false)
  redirect(`/checkout?bookingId=${bookingId}`);
};
// Get bookings from database
export const fetchBookings = async () => {
  const user = await getAuthUser();
  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id,
      paymentStatus: true,
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
    //latest booking will be displayed first
    orderBy: {
      checkIn: "desc",
    },
  });
  return bookings;
};
// Delete booking from database
export async function deleteBookingAction(prevState: { bookingId: string }) {
  const { bookingId } = prevState;
  const user = await getAuthUser();
  try {
    const result = await db.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });
    revalidatePath("/bookings");
    return { message: "Booking deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
}

//Remove the rental but only the owner of the property have ability to do it
export const deleteRentalAction = async (prevState: { propertyId: string }) => {
  const { propertyId } = prevState;
  const user = await getAuthUser();
  try {
    await db.property.delete({
      where: {
        id: propertyId,
        profileId: user.id,
      },
    });
    revalidatePath("/rentals");
    return { message: "Rentals deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//Get all property for that user
export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });
  //Promise.all: To ensures that all asynchronous operations for each rental are executed in parallel
  const rentalsWithBookingSums = await Promise.all(
    rentals.map(async (rental) => {
      //.aggregate: to perform summing values for each rental associated bookings
      const totalNightsSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        //To sum up totalNights
        _sum: {
          totalNights: true,
        },
      });

      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        //To sum up orderTotal
        _sum: {
          orderTotal: true,
        },
      });

      return {
        //Merge the original rental information with the additional data (the sums of totalNights and orderTotal)
        ...rental,
        //Represents the sum of totalNights for all bookings associated with the rental.
        totalNightsSum: totalNightsSum._sum.totalNights,
        // which is the sum of the orderTotal for all bookings associated with the rental.
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    })
  );

  return rentalsWithBookingSums;
};

//Get all of the current value of that Rental
export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();

  return db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id,
    },
  });
};

export const updatePropertyAction = async (
  prevState: any,
  formData: FormData
  //Function will return a Promise that resolves to an object with a message property of type string.
): Promise<{ message: string }> => {
  const user = await getAuthUser(); //Get user
  const propertyId = formData.get("id") as string; //Get propertyId from the hidden input
  try {
    //converts the FormData object into a plain JavaScript object, making it easier to work with
    const rawData = Object.fromEntries(formData);
    //Validates rawData using propertySchema
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Update Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const updatePropertyImageAction = async (
  prevState: any,
  formData: FormData
  //Function will return a Promise that resolves to an object with a message property of type string.
): Promise<{ message: string }> => {
  const user = await getAuthUser(); //Get user
  const propertyId = formData.get("id") as string; //Get propertyId from the hidden input

  try {
    const image = formData.get("image") as File; //Get image from the input field
    //Validates image using imageSchema
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image); // Upload to supabase
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Property Image Updated Successful" };
  } catch (error) {
    return renderError(error);
  }
};

//Looking for properties that are owned by this specific user
export const fetchReservations = async () => {
  const user = await getAuthUser(); //Get user

  const reservations = await db.booking.findMany({
    where: {
      paymentStatus: true,
      property: {
        profileId: user.id,
      },
    },

    orderBy: {
      //Most recent booking displayed first
      createdAt: "desc", // or 'asc' for ascending order
    },
    //Display info
    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      }, // include property details in the result
    },
  });
  return reservations;
};
//Get the total info on the user properties and booking
//Only admin can make this request
export const fetchStats = async () => {
  await getAdminUser();

  //.count(): from prisma
  const usersCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count({
    where: {
      paymentStatus: true,
    },
  });

  return {
    usersCount,
    propertiesCount,
    bookingsCount,
  };
};

//Get data from database
export const fetchChartsData = async () => {
  await getAdminUser(); //Check for admin user
  const date = new Date(); //Current Date
  //This subtracts 6 months from the current date by getting the current month (date.getMonth()) and using .setMonth() to update the Date object.
  date.setMonth(date.getMonth() - 6);
  const sixMonthsAgo = date;

  //Fetch booking where the create date < 6 months ago
  const bookings = await db.booking.findMany({
    where: {
      paymentStatus: true,
      createdAt: {
        gte: sixMonthsAgo, //gte = greater than or equals
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  //total : returning from running this function
  //current : the item in the iteration ; current = bookings
  const bookingsPerMonth = bookings.reduce((total, current) => {
    //Get month and year for that particular bookings (Ex: May of 2024)
    const date = formatDate(current.createdAt, true);
    //Check if date(month, year) is already stored in array
    const existingEntry = total.find((entry) => entry.date === date);
    //Count how many bookings have been made in that sepcific month
    //meaning a booking already exists for the given month and year
    if (existingEntry) {
      //we + 1 for that booking month
      existingEntry.count += 1;
      // meaning no previous booking for that month
    } else {
      //Add a new object { date, count: 1 } to the total array
      total.push({ date, count: 1 });
    }
    return total;
    //returning an array
  }, [] as Array<{ date: string; count: number }>);
  return bookingsPerMonth;
};
