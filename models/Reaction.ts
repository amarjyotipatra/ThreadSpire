import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import User from './User';
import ThreadSegment from './ThreadSegment';

// Define reaction types allowed in the app
export enum ReactionType {
  MIND_BLOWN = '🤯',
  LIGHT_BULB = '💡',
  RELAXED = '😌',
  FIRE = '🔥',
  HEART_HANDS = '🫶',
}

interface ReactionAttributes {
  id: string;
  userId: string;
  segmentId: string;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

class Reaction extends Model<ReactionAttributes> implements ReactionAttributes {
  public id!: string;
  public userId!: string;
  public segmentId!: string;
  public type!: ReactionType;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Reaction.init(
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
    segmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'thread_segments',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ReactionType)),
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
    modelName: 'Reaction',
    tableName: 'reactions',
    indexes: [
      // Ensure a user can only react once to a segment
      {
        unique: true,
        fields: ['userId', 'segmentId'],
      },
    ],
  }
);

Reaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Reaction.belongsTo(ThreadSegment, { foreignKey: 'segmentId', as: 'segment' });
ThreadSegment.hasMany(Reaction, { foreignKey: 'segmentId', as: 'reactions' });

export default Reaction;