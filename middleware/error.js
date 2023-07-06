//middleware to run when exception occurs
module.exports = function(err, req, res, next){
    res.status(500).send('Something failed');//500->Internal server error.
}