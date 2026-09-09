require('dotenv').config();
require('express-async-errors'); // patch express agar async error otomatis ke next(err)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Nexa Clinic API is running' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
