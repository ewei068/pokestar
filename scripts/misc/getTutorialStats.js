require("dotenv").config();
const fs = require("fs");
const { collectionNames } = require("../../src/config/databaseConfig");
const { newTutorialStages } = require("../../src/config/questConfig");
const { countDocuments } = require("../../src/database/mongoHandler");

const data = {};

const DEFAULT_DAYS = 30;
const days = process.argv[2] || DEFAULT_DAYS;

const getTutorialStats = async () => {
  const lastMonthTime = new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * days
  ).getTime();
  const totalUsersThisMonth = await countDocuments(collectionNames.USERS, {
    lastCorrected: {
      $gte: lastMonthTime,
    },
  });
  data.total = totalUsersThisMonth;
  for (const tutorialStage of newTutorialStages) {
    const totalUsers = await countDocuments(collectionNames.USERS, {
      [`tutorialData.completedTutorialStages.${tutorialStage}`]: true,
      lastCorrected: {
        $gte: lastMonthTime,
      },
    });
    data[tutorialStage] = totalUsers;
  }

  console.log(data);

  // save to csv
  const csv = Object.entries(data)
    .map(([key, value]) => `${key},${value}`)
    .join("\n");
  fs.writeFileSync("tutorialStats.csv", csv);
};

getTutorialStats();
