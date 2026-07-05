const { app } = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`UK49s backend listening on port ${PORT}`);
});
