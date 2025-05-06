import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import User from './User';
import Thread from './Thread';

interface BookmarkAttributes {
  id: string;
  userId: string;
  threadId: string;
  createdAt: Date;
  updatedAt: Date;
}

class Bookmark extends Model<BookmarkAttributes> implements BookmarkAttributes {
  public id!: string;
  public userId!: string;
  public threadId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Bookmark.init(
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
    threadId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    modelName: 'Bookmark',
    tableName: 'bookmarks',
    indexes: [
      // Ensure a user can only bookmark a thread once
      {
        unique: true,
        fields: ['userId', 'threadId'],
      },
    ],
  }
);

Bookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Bookmark.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });
Thread.hasMany(Bookmark, { foreignKey: 'threadId', as: 'bookmarks' });
User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks' });

export default Bookmark;