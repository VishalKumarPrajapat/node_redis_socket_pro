import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { CURRENT_TIME } from '../utils/constants';

const Sessions = sequelize.define('sessions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING(555),
        allowNull: false
    },
    is_valid: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true
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
export { Sessions };

