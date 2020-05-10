// Not really "Into"
export const LoadIntoArray = (arr, raws, clazz) => {
  arr.forEach(a => (a.flag = false));
  raws.forEach(raw => {
    var current = arr.find(a => a.name == raw.name);
    if (!current) {
      current = new clazz();
      arr.push(current);
    }
    current.Load(raw);
    current.flag = true;
  });
  return arr.filter(a => a.flag);
};

export const Diff = (a, b, names = true) => {
  var d = Array.isArray(b) ? [] : {};
  let is_different = false;
  if (a) {
    Object.keys(b).forEach(k => {
      if (typeof b[k] === 'object') {
        var dd = Diff(a[k], b[k], names);
        if (dd) {
          d[k] = dd;
          is_different = true;
        }
      } else if (b[k] != a[k]) {
        d[k] = b[k];
        is_different = true;
      }
    });
    // If there is a name, that's used to help load the raw
    if (names && b.name != undefined) {
      //} && is_different) {
      d.name = b.name;
      is_different = true;
    }
    if (is_different) {
      return d;
    }
    return false;
  } else {
    return b;
  }
};

export const Combine = arr => {
  var c = arr.length > 0 && Array.isArray(arr[0]) ? [] : {};
  arr.forEach(a => {
    Object.keys(a).forEach(k => {
      if (typeof a[k] === 'object') {
        if (c[k] == undefined) {
          c[k] = Combine(arr.map(r => r[k]).filter(i => i != undefined));
        }
      } else {
        c[k] = a[k];
      }
    });
  });

  return c;
};
