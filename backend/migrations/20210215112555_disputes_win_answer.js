exports.up = function(knex, Promise) {
  return knex.schema.table('disputes', table => {
    table.text('win_answer');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('disputes', table => {
    table.dropColumn('win_answer');
  });
};