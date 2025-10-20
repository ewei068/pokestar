/* eslint-disable no-console */
require("dotenv").config();
const { updateDocument } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const tutorialUserId = "638163104236175427";
const userId = process.argv[2] || tutorialUserId;
const rewardsToAdd = 10;

// Add 10 voting rewards to the specified user

const addVotingRewards = async () => {
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId },
      {
        $inc: {
          "voting.rewards": rewardsToAdd,
        },
      }
    );

    if (res.matchedCount === 0) {
      console.log(`No user found with ID: ${userId}`);
      return { success: false, message: "User not found" };
    }

    if (res.modifiedCount === 0) {
      console.log(`Failed to add voting rewards for user: ${userId}`);
      return { success: false, message: "Failed to update user" };
    }

    console.log(
      `Successfully added ${rewardsToAdd} voting rewards to user: ${userId}`
    );
    return { success: true, message: `Added ${rewardsToAdd} voting rewards` };
  } catch (error) {
    console.error("Error adding voting rewards:", error);
    return { success: false, message: error.message };
  }
};

addVotingRewards()
  .then((res) => {
    console.log("Result:", res);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
