export NODE_CLUSTER_SCHED_POLICY=none
export HOST=localhost
export PORT=5000
export CONNECTION=mongodb://127.0.0.1:27017
export DBNAME=uptesting
export BASEPATH=/services
export JWT_SECRET=YouNeedChangeThis
export APP_SALT_SECONDAY=changeSecondarySalt
#nodemon index.js
sudo perf record -e cycles:u -g -- node --perf-basic-prof index.js