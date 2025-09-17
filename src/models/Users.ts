import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { CURRENT_TIME } from '../utils/constants';

const Users = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(55),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(55),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_online: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,  
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: CURRENT_TIME
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
export { Users };

