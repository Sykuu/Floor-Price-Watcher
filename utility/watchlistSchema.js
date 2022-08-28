const mongoose = require('mongoose');

const watchlistSchema = mongoose.Schema({
  apiName: String,
  printName: String,
  thumbnailUrl: String,
  condition: String,
  price: Number,
  guildId: String,
  socials: { twitter: String, discord: String },
});

module.exports = mongoose.model('magicedenWatchlist', watchlistSchema);
