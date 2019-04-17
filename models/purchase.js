'use strict';
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    product: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.NUMERIC,
    vendor: DataTypes.STRING,
    order_id: DataTypes.STRING
  }, {});
  Purchase.associate = function(models) {
    // associations can be defined here
  };
  return Purchase;
};