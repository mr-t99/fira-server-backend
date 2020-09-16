function cvtAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// cvtNameToEmail('Nguyễn Hoàng Sỹ', '@bdu.edu.vn')
// => nhsy@bdu.edu.vn
function cvtNameToEmail(name, domain) {
  const nameNoAccents = cvtAccents(name);
  const words = nameNoAccents.split(' ');

  return (
    words
      .map((w, i) => {
        return i === words.length - 1 ? w : w[0];
      })
      .join('')
      .toLowerCase() + domain
  );
}
module.exports = {
  cvtNameToEmail
};