import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { CURRENT_TIME } from '../utils/constants';

const Messages = sequelize.define('messages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.STRING(555),
        allowNull: true
    },
    room: {
        type: DataTypes.STRING(55),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: CURRENT_TIME
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: CURRENT_TIME
    }
}, {
    timestamps: false,
    freezeTableName: true
});
export { Messages };

