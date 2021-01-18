
exports.up = async function (knex) {

  const disputes = await knex.schema.createTable('disputes', table => {
    table.increments();
    table.text('title').notNullable();
    table.dateTime('expired_at');
    table.timestamps(true, true);
  });

  const answers = await knex.schema.createTable('answers', table => {
    table.increments();
    table.text('value').notNullable();
    table.integer('dispute_id').notNullable()
        .references('id').inTable('disputes');
    table.timestamps(true, true);
  });

  return Promise.all([disputes, answers]);
};

exports.down = async function (knex) {
  const disputes = await knex.schema.dropTable('disputes');
  const answers = await knex.schema.dropTable('answers');
  return Promise.all([disputes, answers]);
};
