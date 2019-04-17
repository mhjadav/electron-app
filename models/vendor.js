'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    area: DataTypes.STRING
  }, {});
  Vendor.associate = function(models) {
    // associations can be defined here
  };
  return Vendor;
};