function StandardEmbed(title, url, description, fields, thumbnailUrl) {
  this.title = title;
  this.url = url;
  this.description = description;
  this.thumbnail = { url: thumbnailUrl };
  this.fields = fields;
  this.timestamp = new Date();
  this.footer = {
    text: 'Developed by !Syku#9345',
    // icon_url: 'https://i.imgur.com/AfFp7pu.png',
  };
}

function SuccessEmbed(description) {
  this.color = '#3ef035';
  this.description = description;
}

function ErrorEmbed(description) {
  this.color = '#f03535';
  this.description = description;
}

function SimpleEmbed(description) {
  this.description = description;
}

module.exports = { StandardEmbed, SuccessEmbed, ErrorEmbed, SimpleEmbed };
