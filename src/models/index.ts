
import { Users } from './Users';
import { Sessions } from './Sessions';
import { Messages } from './Messages';

/** relalton with session */
Users.hasMany(Sessions, { foreignKey: 'user_id', as: 'sessions' });
Sessions.belongsTo(Users, { foreignKey: 'user_id' });

/** relation user with messsage */
Users.hasMany(Messages, { foreignKey: 'user_id', as: 'messages' });
Messages.belongsTo(Users, { foreignKey: 'user_id' });

/** Export all models */
export {
    Users,
    Sessions,
    Messages
};
