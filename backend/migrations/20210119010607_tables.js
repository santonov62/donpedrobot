
exports.up = async function (knex) {

  const disputes = await knex.schema.createTable('disputes', table => {
    table.increments();
    table.text('title').notNullable();
    table.text('message_id');
    table.text('chat_id');
    table.dateTime('resolved_at');
    table.dateTime('expired_at');
    table.timestamps(true, true);
  });

  const answers = await knex.schema.createTable('answers', table => {
    table.increments();
    table.text('value').notNullable();
    table.text('username').notNullable();
    table.integer('dispute_id').notNullable()
        .references('id').inTable('disputes');
    table.timestamps(true, true);
  });

  return Promise.all([disputes, answers]);
};

exports.down = async function (knex) {
  const answers = await knex.schema.dropTable('answers');
  const disputes = await knex.schema.dropTable('disputes');
  return Promise.all([disputes, answers]);
};
