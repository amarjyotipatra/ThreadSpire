import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import Thread from './Thread';

interface ThreadSegmentAttributes {
  id: string;
  threadId: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

class ThreadSegment extends Model<ThreadSegmentAttributes> implements ThreadSegmentAttributes {
  public id!: string;
  public threadId!: string;
  public content!: string;
  public order!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ThreadSegment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    threadId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'threads',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: 'ThreadSegment',
    tableName: 'thread_segments',
  }
);

ThreadSegment.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });
Thread.hasMany(ThreadSegment, { foreignKey: 'threadId', as: 'segments' });

export default ThreadSegment;