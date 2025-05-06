import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import Collection from './Collection';
import Thread from './Thread';

interface CollectionItemAttributes {
  id: string;
  collectionId: string;
  threadId: string;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

class CollectionItem extends Model<CollectionItemAttributes> implements CollectionItemAttributes {
  public id!: string;
  public collectionId!: string;
  public threadId!: string;
  public addedAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CollectionItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'collections',
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
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    modelName: 'CollectionItem',
    tableName: 'collection_items',
    indexes: [
      // Ensure a thread can only be added once to a collection
      {
        unique: true,
        fields: ['collectionId', 'threadId'],
      },
    ],
  }
);

CollectionItem.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
CollectionItem.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });
Collection.hasMany(CollectionItem, { foreignKey: 'collectionId', as: 'items' });
Thread.hasMany(CollectionItem, { foreignKey: 'threadId', as: 'collectionItems' });

export default CollectionItem;