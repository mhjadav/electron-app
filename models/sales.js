'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sales = sequelize.define('Sales', {
    product: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.NUMERIC,
    vendor: DataTypes.STRING,
    order_id: DataTypes.STRING
  }, {});
  Sales.associate = function(models) {
    // associations can be defined here
  };
  return Sales;
};