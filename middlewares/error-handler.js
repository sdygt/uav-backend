module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    res.json({'status': 'error', 'message': err.message}).end();
};
