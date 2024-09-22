const { onFormSelect, buildDeoxysSend } = require("../../services/mythic");

const deoxysFormSelect = async (interaction, data) => {
  const updateRes = await onFormSelect(interaction.user, data.speciesId);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  const { send, err } = await buildDeoxysSend(interaction.user);
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = deoxysFormSelect;
