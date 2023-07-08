/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * social.js Runs all base level logic for social interactions. Currently only Leaderboards.
*/
const { QueryBuilder } = require("../database/mongoHandler");

const LEADERBOARD_SIZE = 10;

//gets the relevant leaderboard the user selected
const getLeaderboard = async (categoryData, subset) => {
    const filter = {};
    if (subset) {
        filter.userId = {
            $in: subset
        }
    }

    const query = new QueryBuilder(categoryData.collection)
        .setFilter(filter)
        .setLimit(LEADERBOARD_SIZE)
        // join strings in array with "."
        .setSort({ [categoryData.label.join(".")]: -1});

    const res = await query.find();
    if (res.length == 0) {
        return { data: null, err: "No users found." };
    } else if (res.length > LEADERBOARD_SIZE) {
        res.pop();
    }

    // build an array of [{ user, label=categoryConfig.label }]
    const rv = res.map((entry) => {
        let label = entry;
        for (const key of categoryData.label) {
            label = label[key];
        }
        return {
            user: entry.user,
            label: label
        };
    });

    return { data: rv, err: null };

}

module.exports = {
    getLeaderboard
}