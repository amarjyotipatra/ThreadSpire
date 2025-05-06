import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import User from './User';

interface ThreadAttributes {
  id: string;
  userId: string;
  title: string;
  tags?: string[];
  isPublished: boolean;
  originalThreadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

class Thread extends Model<ThreadAttributes> implements ThreadAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public tags!: string[];
  public isPublished!: boolean;
  public originalThreadId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Thread.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    originalThreadId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'threads',
        key: 'id',
      },
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
    modelName: 'Thread',
    tableName: 'threads',
  }
);

Thread.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Thread.belongsTo(Thread, { foreignKey: 'originalThreadId', as: 'originalThread' });
Thread.hasMany(Thread, { foreignKey: 'originalThreadId', as: 'forks' });

export default Thread;