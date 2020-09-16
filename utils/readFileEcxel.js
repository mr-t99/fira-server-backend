const xlsx = require('xlsx');
const cvtToDateStr = require('./time');
const PATCH_GV = process.env.PATCH_GV || './upload/CBGD.xls';
const PATCH_TKB = process.env.PATCH_GV || './upload/tkb.xlsx';
const PATCH_CONVERT = process.env.PATCH_GV || './upload/convert.xls';
// const PATCH_GV = process.env.PATCH_GV || '../upload/CBGD.xls';
// const PATCH_TKB = process.env.PATCH_GV || '../upload/tkb.xlsx';
// const PATCH_CONVERT = process.env.PATCH_GV || '../upload/convert.xls';

convertToOjectGv = (opject) => {
  var phai;
  if (opject.__EMPTY_3 === "N") {
    phai = "Nữ";
  } else {
    phai = "Nam"
  }
  return {
    m_gvien: opject.msgv,
    ten: opject.__EMPTY + ' ' + opject.__EMPTY_1,
    n_sinh: cvtToDateStr(opject.__EMPTY_2),
    phai: phai,
    khoa: opject.__EMPTY_4,
    t_do: opject.__EMPTY_5,
  };
};

convertDateMysql = (arry) => {
  const date = arry.split('/').reverse();
  date[0] = 20 + date[0];
  return date.join('/');
};
convertToOjectTkb = (opject) => {
  var ngay_bd, ngay_kt, ma_gv;
  if (opject.f_tghoc === undefined || opject.f_tghoc.length === 0) {
    ngay_bd = '1000-01-01';
    ngay_kt = '1000-01-01';
  } else {
    const date = opject.f_tghoc.split('-');
    ngay_bd = convertDateMysql(date[0]);
    ngay_kt = convertDateMysql(date[1]);
  }
  if (opject.f_manv == null) {
    ma_gv = null;
  } else {
    ma_gv = opject.f_manv;
  }
  return {
    thu: opject.f_thu,
    t_bdau: opject.f_tietbd,
    s_tiet: opject.f_sotiet,
    m_mon: opject.f_mamh,
    t_mon: opject.f_tenmhvn,
    s_so: opject.f_sisoctgh,
    m_gvien: ma_gv,
    phong: opject.f_tenph,
    lop: opject.f_malp,
    n_bdau: ngay_bd,
    n_kthuc: ngay_kt,
    sum_tiet: opject.f_sotiets
  };
};
convertPhong = (opject) => {
  var khu;
  const mang = opject.split('');
  //console.log(mang);
  khu = (string) => {
    switch (string) {
      case 'A':
        return 'Khu A';
        break;
      case 'B':
        return 'Khu B';
        break;
      case 'C':
        return 'Khu C';
        break;
      case 'E':
        return 'Khu E';
        break;
      default:
        return 'null';
        break;
    }
  };
  return {
    t_phong: opject,
    khu: khu(mang[0]),
  };
};
data_gv = () => {
  //sửa định dạng dữ liệu
  const workbook = xlsx.readFile(PATCH_GV);
  let sheetName = workbook.SheetNames[0];
  const newWorkbook = workbook;
  newWorkbook.Sheets[sheetName]['A1'].v = 'msgv';
  xlsx.writeFile(workbook, PATCH_CONVERT);
  //đọc file convert data
  const dataTable = xlsx.readFile(PATCH_CONVERT, { raw: true });
  const netData = dataTable.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(netData);

  const data = jsonData.reduce((acc, item) => {
    acc.push(convertToOjectGv(item));
    return acc;
  }, []);
  data.splice(0, 1);
  return data;
};

data_tkb = () => {
  const workbook = xlsx.readFile(PATCH_TKB);
  let sheetName = workbook.SheetNames[0];
  const netData = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(netData);
  const data = jsonData.reduce((databeta, item) => {
    databeta.push(convertToOjectTkb(item));
    return databeta;
  }, []);
  return data;
};
data_phong = () => {
  const tkb = data_tkb();
  const allroom = new Array();
  tkb.forEach((element) => {
    if (element.phong == null) {
      element.phong = 'null';
    }
    if (allroom.indexOf(element.phong) == -1) {
      allroom.push(element.phong);
    }
  });
  const data_phong = allroom.reduce((data, item) => {
    data.push(convertPhong(item));
    return data;
  }, []);
  return data_phong;
};
mon = (t_mon, m_mon) => {
  return {
    t_mon: t_mon,
    m_mon: m_mon
  }
}
gientkbOpject = (opject) => {
  return {
    m_gvien: opject.m_gvien,
    lop: opject.lop,
    s_so: opject.s_so,
    thu: opject.thu,
    phong: opject.phong,
    m_mon: opject.m_mon,
    t_mon: opject.t_mon,
    t_bdau: opject.t_bdau,
    s_tiet: opject.s_tiet,
    n_bdau: opject.n_bdau,
    n_kthuc: opject.n_kthuc
  }
}
tkb_gvien = () => {
  const data = data_tkb();
  const tkb_gvien = new Array();
  data.forEach(element => {
    tkb_gvien.push(gientkbOpject(element));
  })
  return tkb_gvien;
}

data_mon = () => {
  const tkb = data_tkb();
  const m_mon = new Array();
  tkb.forEach((element) => {
    const b = {
      t_mhoc: element.t_mon,
      m_mhoc: element.m_mon,
      s_tiet: element.sum_tiet
    }
    m_mon.push(JSON.stringify(b));
  });
  const data = new Array();
  console.log(data);
  m_mon.forEach(element=>{
    if(data.indexOf(element)===-1){
      data.push(element);
    }
  })
  const m_hoc = new Array();
  data.forEach(element=>{
    m_hoc.push(JSON.parse(element));
  })
  return m_hoc;
};

// console.log(typeof(data_phong()[0]))
// console.log(data_tkb());
// data_mon();
// console.log(data_tkb())

module.exports = {
  data_gv: data_gv,
  data_tkb: data_tkb,
  data_phong: data_phong,
  tkb_gvien: tkb_gvien,
  data_mon: data_mon
};
