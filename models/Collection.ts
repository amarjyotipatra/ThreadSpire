import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import User from './User';

interface CollectionAttributes {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public description!: string;
  public isPrivate!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Collection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Collection',
    tableName: 'collections',
  }
);

Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Collection, { foreignKey: 'userId', as: 'collections' });

export default Collection;