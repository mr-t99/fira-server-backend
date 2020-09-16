function cvtToDateStr(date, dft) {
  if (!date || typeof date !== 'number') {
    return dft || '';
  }
  const utcTime = Math.floor(date - 25569) * 86400;
  const dateInfo = new Date(utcTime * 1000);
  return `${dateInfo.getFullYear()}-${
    dateInfo.getMonth() + 1
  }-${dateInfo.getDate()}`;
}

module.exports = cvtToDateStr;
