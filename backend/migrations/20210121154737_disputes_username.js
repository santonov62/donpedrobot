exports.up = function(knex, Promise) {
  return knex.schema.table('disputes', table => {
    table.text('username');
  });

};

exports.down = function(knex, Promise) {
  return knex.schema.table('disputes', table => {
    table.dropColumn('username');
  });
};