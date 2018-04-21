const config = require('config');

let configer = {
    get: (key) => {
        //dynamic items
        const _overrides = {
            'MONGO_URI': process.env.MONGO_URI
            || (config.has('MONGO_URI') ? config.get('MONGO_URI') : undefined)
            || `mongodb://${process.env.MONGODB_PORT_27017_TCP_ADDR}:${process.env.MONGODB_PORT_27017_TCP_PORT}/`
            || `mongodb://${config.get('MONGODB_PORT_27017_TCP_ADDR')}:${config.get('MONGODB_PORT_27017_TCP_PORT')}/`
        };

        return _overrides[key] || process.env[key] || config.get(key);
    }
};

module.exports = configer;
