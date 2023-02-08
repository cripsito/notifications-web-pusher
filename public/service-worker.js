const img = 'https://random.imagecdn.app/500/150';
const text = `HEY! Your task  is now overdue.`;
const notification = new Notification('To do list', {
  body: text,
  icon: img,
});
