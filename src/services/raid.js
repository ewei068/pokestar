const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { eventNames } = require("../config/eventConfig");
const { raids, raidConfig, difficultyConfig } = require("../config/npcConfig");
const { buildRaidListEmbed, buildRaidEmbed } = require("../embeds/battleEmbeds");
const { getState } = require("./state");
const { getTrainer } = require("./trainer");

const buildRaidSend = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    // TODO: check if trainer has active raid

    const send = {
        content: "",
        embeds: [],
        components: []
    }
    if (state.view === "list") {
        // list raids
        const embed = buildRaidListEmbed();
        send.embeds.push(embed);

        // build raid list select
        const raidSelectRowData = {
            stateId: stateId,
        };
        const raidSelectRow = buildIdConfigSelectRow(
            Object.values(raids),
            raidConfig,
            "Select a Raid to battle:",
            raidSelectRowData,
            eventNames.RAID_SELECT,
            false
        );
        send.components.push(raidSelectRow);
    } else if (state.view === "raid") {
        // view raid
        const raidId = state.raidId;
        const raidData = raidConfig[raidId];
        if (!raidData) {
            return { send: null, err: "Invalid raid selection" };
        }

        const embed = buildRaidEmbed(raidId);
        send.embeds.push(embed);

        // build difficulty select
        const difficultySelectData = {
            stateId: stateId,
        }
        const difficultyButtonConfigs = Object.keys(raidData.difficulties).map(difficulty => {
            return {
                label: difficultyConfig[difficulty].name,
                disabled: false,
                data: {
                    ...difficultySelectData,
                    difficulty: difficulty,
                }
            }
        });
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            "test",
        );
        send.components.push(difficultyRow);

        // build return button
        const returnData = {
            stateId: stateId,
        }
        const returnButtonConfigs = [
            {
                label: "Return",
                disabled: false,
                data: returnData,
            }
        ]
        const returnRow = buildButtonActionRow(
            returnButtonConfigs,
            eventNames.RAID_RETURN,
        );

        send.components.push(returnRow);
    }

    return { send: send, err: null };
}

module.exports = {
    buildRaidSend
};
